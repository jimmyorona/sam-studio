const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'pptx_to_video.py');
const SUPERTONIC_SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'supertonic_synth.py');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
const PERSONAS_DIR = path.join(__dirname, '..', '..', 'personas');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const REVIEWER_SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'reviewer_synth.py');
const REVIEWS_DIR = path.join(__dirname, '..', '..', 'reviews');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// In-memory job store: jobId -> { status, logs, outputPath, inputPath, originalName, clients }
const jobs = new Map();

// ---------------------------------------------------------------------------
// ffmpeg / ElevenLabs SDK helpers (used by the elevenlabs-js synthesis path)
// ---------------------------------------------------------------------------
function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      audioPath,
    ]);
    let out = '';
    proc.stdout.on('data', d => (out += d));
    proc.on('close', code => code === 0 ? resolve(parseFloat(out.trim())) : reject(new Error(`ffprobe failed (${code})`)));
    proc.on('error', reject);
  });
}

function runFFmpeg(args, pushLog) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    proc.stderr.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
    proc.on('error', reject);
  });
}

async function generateElevenLabsMusic(prompt, durationSeconds, apiKey, outputPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: prompt,
      duration_seconds: Math.min(Math.max(parseInt(durationSeconds) || 10, 1), 600),
      prompt_influence: 0.5,
    });

    const request = https.request(
      'https://api.elevenlabs.io/v1/sound-generation',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 120000,
      },
      resp => {
        if (resp.statusCode !== 200) {
          let data = '';
          resp.on('data', chunk => (data += chunk));
          resp.on('end', () => {
            reject(new Error(`ElevenLabs returned ${resp.statusCode}: ${data}`));
          });
          return;
        }
        const stream = fs.createWriteStream(outputPath);
        resp.pipe(stream);
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      }
    );
    request.on('error', reject);
    request.on('timeout', () => { request.destroy(); reject(new Error('Music generation timed out')); });
    request.write(postData);
    request.end();
  });
}

async function mixMusicIntoVideo(videoPath, musicPath, musicVolumeDb, outputPath, pushLog) {
  pushLog('Mixing background music ...');
  await runFFmpeg([
    '-y',
    '-i', videoPath,
    '-i', musicPath,
    '-filter_complex',
    `[1:a]aloop=loop=-1:size=2e+09,asetpts=PTS-STARTPTS,volume=${musicVolumeDb}dB[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[aout]`,
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    outputPath,
  ], pushLog);
}

async function synthesizeElevenLabsSDKSlides(narrations, workDir, opts, pushLog) {
  const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
  const client = new ElevenLabsClient({ apiKey: opts.apiKey });

  for (let i = 0; i < narrations.length; i++) {
    const outPath = path.join(workDir, `slide_${String(i + 1).padStart(3, '0')}.mp3`);
    pushLog(`  ElevenLabs SDK: slide ${i + 1}/${narrations.length} ...`);

    const response = await client.textToSpeech.convert(opts.voiceId, {
      text: narrations[i],
      model_id: opts.modelId,
      output_format: 'mp3_44100_128',
      voice_settings: {
        stability:        parseFloat(opts.stability),
        similarity_boost: parseFloat(opts.similarity),
        style:            parseFloat(opts.style),
        speed:            parseFloat(opts.speed),
        use_speaker_boost: opts.speakerBoost !== 'false' && opts.speakerBoost !== false,
      },
    });

    // SDK may return a ReadableStream or a Buffer/Uint8Array depending on version
    if (response && typeof response[Symbol.asyncIterator] === 'function') {
      const chunks = [];
      for await (const chunk of response) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      fs.writeFileSync(outPath, Buffer.concat(chunks));
    } else {
      fs.writeFileSync(outPath, Buffer.from(response));
    }
  }
}

async function synthesizeEdgeTTSSlides(narrations, workDir, voice, pushLog) {
  for (let i = 0; i < narrations.length; i++) {
    const outPath = path.join(workDir, `slide_${String(i + 1).padStart(3, '0')}.mp3`);
    pushLog(`  Edge TTS: slide ${i + 1}/${narrations.length} ...`);
    await new Promise((resolve, reject) => {
      const proc = spawn('edge-tts', ['--voice', voice, '--text', narrations[i], '--write-media', outPath]);
      proc.stderr.on('data', chunk => {
        const msg = chunk.toString().trim();
        if (msg) pushLog(msg);
      });
      proc.on('close', code => code === 0 ? resolve() : reject(new Error(`edge-tts exited ${code}`)));
      proc.on('error', reject);
    });
  }
}

// Supertonic is a Python package, so review-mode synthesis bridges to a small
// helper script that loads the model once and writes slide_NNN.wav files.
async function synthesizeSupertonicSlides(narrations, workDir, stOpts, pushLog) {
  const narrationsFile = path.join(workDir, 'supertonic_narrations.json');
  fs.writeFileSync(narrationsFile, JSON.stringify(narrations));
  await new Promise((resolve, reject) => {
    const proc = spawn('python3', [
      SUPERTONIC_SCRIPT_PATH,
      '--workdir', workDir,
      '--narrations', narrationsFile,
      '--voice', stOpts.voice || 'M1',
      '--lang', stOpts.lang || 'en',
      '--steps', String(stOpts.steps ?? 8),
      '--speed', String(stOpts.speed ?? 1.0),
    ]);
    proc.stdout.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.stderr.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`supertonic_synth exited ${code}`)));
    proc.on('error', reject);
  });
  fs.unlink(narrationsFile, () => {});
}

// Resolve a slide's audio file regardless of extension (Edge/ElevenLabs emit
// .mp3, Supertonic emits .wav). ffmpeg/ffprobe read by content, not name.
function resolveSlideAudio(workDir, index) {
  const stem = path.join(workDir, `slide_${String(index + 1).padStart(3, '0')}`);
  for (const ext of ['.mp3', '.wav']) {
    if (fs.existsSync(stem + ext)) return stem + ext;
  }
  return stem + '.mp3'; // fall back to historical default for error messaging
}

async function assembleVideoFromManifest(manifest, outputPath, pushLog) {
  const { work_dir, images, pause = 1.0, anim_fps = 8 } = manifest;
  const segmentPaths = [];
  const vf = 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black';

  for (let i = 0; i < images.length; i++) {
    const audio = resolveSlideAudio(work_dir, i);
    const segment = path.join(work_dir, `segment_${String(i + 1).padStart(3, '0')}.mp4`);
    const duration = await getAudioDuration(audio) + pause;
    // images[i] may be a string (legacy) or an array (new format)
    const imgGroup = Array.isArray(images[i]) ? images[i] : [images[i]];

    pushLog(`  Encoding segment ${i + 1}/${images.length} ...`);

    if (imgGroup.length === 1) {
      await runFFmpeg([
        '-y', '-loop', '1', '-i', imgGroup[0], '-i', audio,
        '-vf', vf,
        '-c:v', 'libx264', '-tune', 'stillimage',
        '-c:a', 'aac', '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-t', String(duration), '-r', '30', '-shortest',
        segment,
      ], pushLog);
    } else {
      // Animated group: loop frames at anim_fps over the full audio duration
      const frameDur = 1.0 / anim_fps;
      const loopCount = Math.ceil(duration / (imgGroup.length * frameDur)) + 1;
      const framesFile = path.join(work_dir, `frames_${String(i + 1).padStart(3, '0')}.txt`);
      let framesContent = '';
      for (let l = 0; l < loopCount; l++) {
        for (const img of imgGroup) {
          framesContent += `file '${img}'\nduration ${frameDur.toFixed(6)}\n`;
        }
      }
      framesContent += `file '${imgGroup[imgGroup.length - 1]}'\n`;
      fs.writeFileSync(framesFile, framesContent);

      await runFFmpeg([
        '-y', '-f', 'concat', '-safe', '0', '-i', framesFile,
        '-i', audio,
        '-vf', vf,
        '-c:v', 'libx264',
        '-c:a', 'aac', '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-r', '30', '-shortest',
        segment,
      ], pushLog);
    }

    segmentPaths.push(segment);
  }

  const concatFile = path.join(work_dir, 'concat_list.txt');
  fs.writeFileSync(concatFile, segmentPaths.map(s => `file '${s}'`).join('\n'));
  pushLog('Concatenating segments ...');
  await runFFmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', concatFile, '-c', 'copy', outputPath], pushLog);
}

// ---------------------------------------------------------------------------
// Single-script narration helpers
//   - joinNarrationsToScript: per-slide → one markdown script with ## SLIDE N headers
//   - parseScriptToNarrations: one script → per-slide array (by ## SLIDE N markers)
//   - stripCuesForTTS: drop director cues / tone notes; SSML kept only for ElevenLabs
// ---------------------------------------------------------------------------
function joinNarrationsToScript(narrations) {
  return narrations
    .map((text, i) => `## SLIDE ${i + 1}\n\n${(text || '').trim()}`)
    .join('\n\n');
}

function parseScriptToNarrations(script, expectedCount) {
  const lines = String(script || '').split(/\r?\n/);
  const slots = new Array(expectedCount).fill(null);
  let current = null;
  let buf = [];
  const flush = () => {
    if (current !== null && current >= 1 && current <= expectedCount) {
      slots[current - 1] = buf.join('\n').trim();
    }
    buf = [];
  };
  for (const line of lines) {
    const m = line.match(/^\s*##\s*SLIDE\s+(\d+)\s*(?:[—\-:].*)?$/i);
    if (m) {
      flush();
      current = parseInt(m[1], 10);
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  const missing = [];
  for (let i = 0; i < expectedCount; i++) {
    if (slots[i] === null || slots[i] === '') missing.push(i + 1);
  }
  return { narrations: slots.map(s => s || ''), missing };
}

function stripCuesForTTS(text, provider) {
  let out = String(text || '');
  // Director markers (never spoken) — single-bracket, may span lines if no nested ']'
  out = out.replace(/\[VISUAL CUE:[^\]]*\]/gi, '');
  // Tone / delivery notes in *(...)* form (never spoken)
  out = out.replace(/\*\(([\s\S]*?)\)\*/g, '');
  // SSML: ElevenLabs SDK accepts it; edge-tts CLI doesn't.
  const isElevenLabs = provider === 'elevenlabs' || provider === 'elevenlabs-js';
  if (!isElevenLabs) {
    out = out.replace(/<break\b[^>]*\/?>(?:<\/break>)?/gi, ' ');
    out = out.replace(/<emphasis\b[^>]*>([\s\S]*?)<\/emphasis>/gi, '$1');
  }
  // Collapse whitespace / blank lines
  out = out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

function makeJobId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const ACCEPTED_EXTENSIONS = ['.pptx', '.md'];

function fileExtension(filename) {
  const lower = filename.toLowerCase();
  for (const ext of ACCEPTED_EXTENSIONS) {
    if (lower.endsWith(ext)) return ext;
  }
  return null;
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename(req, file, cb) {
    const id = makeJobId();
    req._jobId = id;
    const ext = fileExtension(file.originalname) || '.pptx';
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (fileExtension(file.originalname)) return cb(null, true);
    cb(new Error('Only .pptx or .md files are accepted'));
  },
});

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// POST /api/convert  — start a conversion job
// ---------------------------------------------------------------------------
app.post('/api/convert', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No .pptx or .md file uploaded' });

  const jobId = req._jobId;
  const {
    model = 'llama3.2:3b',
    ttsProvider = 'edge',
    voice = 'en-US-AriaNeural',
    pause = '1.0',
    dpi = '150',
    theme = 'default',
    ollamaUrl = 'http://localhost:11434',
    keepTemp = 'false',
    // ElevenLabs fields
    elApiKey = '',
    elVoiceId = 'pNInz6obpgDQGcFmaJgB',
    elModel = 'eleven_multilingual_v2',
    elStability = '0.5',
    elSimilarity = '0.75',
    elStyle = '0.0',
    elSpeed = '1.0',
    elSpeakerBoost = 'true',
    // Supertonic fields
    stVoice = 'M1',
    stLang = 'en',
    stSteps = '8',
    stSpeed = '1.0',
    personaText = '',
    contextText = '',
    animFps = '8',
    // Music fields
    musicEnabled = 'false',
    musicPrompt = '',
    musicDuration = '70',
    musicVolume = '-20',
  } = req.body;

  const inputPath = req.file.path;
  const outputPath = path.join(OUTPUTS_DIR, `${jobId}.mp4`);

  const job = {
    id: jobId,
    status: 'running',
    logs: [],
    outputPath,
    inputPath,
    originalName: req.file.originalname,
    clients: new Set(),
    musicOpts: null,
    musicPath: null,
  };
  jobs.set(jobId, job);

  if (musicEnabled === 'true' && musicPrompt.trim() && elApiKey) {
    job.musicOpts = {
      enabled: true,
      prompt: musicPrompt.trim(),
      duration: parseInt(musicDuration) || 70,
      volume: parseInt(musicVolume) || -20,
      apiKey: elApiKey,
    };
  }

  res.json({ jobId });

  const isMarkdown = fileExtension(job.originalName) === '.md';

  function pushLog(line) {
    job.logs.push(line);
    for (const client of job.clients) {
      client.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
    }
  }

  function finish(status, error = null) {
    job.status = status;
    job.error = error;
    for (const client of job.clients) {
      client.write(`data: ${JSON.stringify({ type: 'done', status, error })}\n\n`);
      client.end();
    }
    fs.unlink(inputPath, () => {});
  }

  function buildBaseArgs() {
    const a = [
      SCRIPT_PATH,
      '--input', inputPath,
      '--output', outputPath,
      '--model', model,
      '--pause', pause,
      '--dpi', dpi,
      '--anim-fps', animFps,
      '--ollama-url', ollamaUrl,
    ];
    if (isMarkdown) a.push('--theme', theme);
    if (keepTemp === 'true') a.push('--keep-temp');
    if (personaText.trim()) a.push('--persona-text', personaText.trim());
    if (contextText.trim()) a.push('--context-text', contextText.trim());
    return a;
  }

  if (ttsProvider === 'elevenlabs-js') {
    // Python handles extraction + rendering + narration only; Node synthesizes + assembles.
    const manifestPath = path.join(OUTPUTS_DIR, `${jobId}-manifest.json`);
    const args = [...buildBaseArgs(), '--tts-provider', 'edge', '--manifest-output', manifestPath];
    const proc = spawn('python3', args);
    proc.stdout.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.stderr.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.on('error', err => finish('error', err.message));
    proc.on('close', async code => {
      if (code !== 0) return finish('error', `Python exited with code ${code}`);
      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        fs.unlink(manifestPath, () => {});
      } catch (err) {
        return finish('error', `Failed to read manifest: ${err.message}`);
      }
      try {
        await synthesizeElevenLabsSDKSlides(manifest.narrations, manifest.work_dir, {
          apiKey: elApiKey, voiceId: elVoiceId, modelId: elModel,
          stability: elStability, similarity: elSimilarity,
          style: elStyle, speed: elSpeed, speakerBoost: elSpeakerBoost,
        }, pushLog);
        await assembleVideoFromManifest(manifest, outputPath, pushLog);
        if (job.musicOpts) {
          try {
            const musicPath = path.join(OUTPUTS_DIR, `${job.id}-music.mp3`);
            await generateElevenLabsMusic(job.musicOpts.prompt, job.musicOpts.duration, job.musicOpts.apiKey, musicPath);
            const mixedPath = outputPath.replace('.mp4', '-mixed.mp4');
            await mixMusicIntoVideo(outputPath, musicPath, job.musicOpts.volume, mixedPath, pushLog);
            fs.renameSync(mixedPath, outputPath);
            fs.unlink(musicPath, () => {});
          } catch (err) {
            pushLog(`Music mixing failed: ${err.message}`);
          }
        }
        const sizeMb = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
        pushLog(`Done! Output: ${outputPath} (${sizeMb} MB)`);
        finish('done');
      } catch (err) {
        finish('error', err.message);
      } finally {
        if (keepTemp !== 'true') fs.rm(manifest.work_dir, { recursive: true, force: true }, () => {});
      }
    });
  } else {
    const args = [...buildBaseArgs(), '--tts-provider', ttsProvider];
    if (ttsProvider === 'elevenlabs') {
      args.push(
        '--elevenlabs-api-key',    elApiKey,
        '--elevenlabs-voice-id',   elVoiceId,
        '--elevenlabs-model',      elModel,
        '--elevenlabs-stability',  elStability,
        '--elevenlabs-similarity', elSimilarity,
        '--elevenlabs-style',      elStyle,
        '--elevenlabs-speed',      elSpeed,
      );
      if (elSpeakerBoost === 'false') args.push('--elevenlabs-no-speaker-boost');
    } else if (ttsProvider === 'supertonic') {
      args.push(
        '--supertonic-voice', stVoice,
        '--supertonic-lang',  stLang,
        '--supertonic-steps', stSteps,
        '--supertonic-speed', stSpeed,
      );
    } else {
      args.push('--voice', voice);
    }

    const proc = spawn('python3', args);
    proc.stdout.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.stderr.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.on('close', async code => {
      if (code !== 0) return finish('error', `Process exited with code ${code}`);
      if (job.musicOpts) {
        try {
          const musicPath = path.join(OUTPUTS_DIR, `${job.id}-music.mp3`);
          await generateElevenLabsMusic(job.musicOpts.prompt, job.musicOpts.duration, job.musicOpts.apiKey, musicPath);
          const mixedPath = outputPath.replace('.mp4', '-mixed.mp4');
          await mixMusicIntoVideo(outputPath, musicPath, job.musicOpts.volume, mixedPath, pushLog);
          fs.renameSync(mixedPath, outputPath);
          fs.unlink(musicPath, () => {});
        } catch (err) {
          pushLog(`Music mixing failed: ${err.message}`);
        }
      }
      finish('done');
    });
    proc.on('error', err => finish('error', err.message));
  }
});

// ---------------------------------------------------------------------------
// GET /api/jobs/:id/stream  — SSE log stream
// ---------------------------------------------------------------------------
app.get('/api/jobs/:id/stream', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Replay buffered logs
  for (const line of job.logs) {
    res.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
  }

  if (job.status !== 'running') {
    res.write(`data: ${JSON.stringify({ type: 'done', status: job.status, error: job.error })}\n\n`);
    return res.end();
  }

  job.clients.add(res);
  req.on('close', () => job.clients.delete(res));
});

// ---------------------------------------------------------------------------
// GET /api/jobs/:id/status
// ---------------------------------------------------------------------------
app.get('/api/jobs/:id/status', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ status: job.status, error: job.error, logCount: job.logs.length });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/:id/download  — stream the MP4
// ---------------------------------------------------------------------------
app.get('/api/jobs/:id/download', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'done') return res.status(400).json({ error: 'Job not complete' });
  if (!fs.existsSync(job.outputPath)) return res.status(404).json({ error: 'Output file missing' });

  const ext = fileExtension(job.originalName) || '.pptx';
  const downloadName = path.basename(job.originalName, ext) + '.mp4';
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.setHeader('Content-Type', 'video/mp4');
  fs.createReadStream(job.outputPath).pipe(res);
});

// ---------------------------------------------------------------------------
// GET /api/personas  — list .md files from video-production/
// ---------------------------------------------------------------------------
app.get('/api/personas', (req, res) => {
  try {
    const files = fs.readdirSync(PERSONAS_DIR)
      .filter(f => /-PERSONA\.md$/i.test(f))
      .sort();
    const personas = files.map(f => {
      const base = f.replace(/^\d+-/, '').replace(/-PERSONA\.md$/i, '').replace(/\.md$/, '');
      const words = base.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      const label = words.join(' ') + ' Persona';
      return { filename: f, label, content: fs.readFileSync(path.join(PERSONAS_DIR, f), 'utf8') };
    });
    res.json({ personas });
  } catch {
    res.json({ personas: [] });
  }
});

// ---------------------------------------------------------------------------
// GET /api/models  — proxy Ollama model list
// ---------------------------------------------------------------------------
app.get('/api/models', (req, res) => {
  const ollamaUrl = req.query.ollamaUrl || 'http://localhost:11434';
  let url;
  try { url = new URL(`${ollamaUrl}/api/tags`); } catch {
    return res.json({ models: [] });
  }
  const lib = url.protocol === 'https:' ? https : http;
  const request = lib.get(url.toString(), { timeout: 8000 }, resp => {
    let data = '';
    resp.on('data', chunk => (data += chunk));
    resp.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.json({ models: (parsed.models || []).map(m => m.name) });
      } catch {
        res.json({ models: [] });
      }
    });
  });
  request.on('error', () => { if (!res.headersSent) res.json({ models: [] }); });
  request.on('timeout', () => { request.destroy(); if (!res.headersSent) res.json({ models: [] }); });
});

// ---------------------------------------------------------------------------
// GET /api/voices  — list edge-tts voices (cached per process lifetime)
// ---------------------------------------------------------------------------
let cachedVoices = null;

app.get('/api/voices', (req, res) => {
  if (cachedVoices) return res.json({ voices: cachedVoices });

  const proc = spawn('edge-tts', ['--list-voices'], { timeout: 20000 });
  let output = '';
  proc.stdout.on('data', chunk => (output += chunk));
  proc.on('close', code => {
    if (res.headersSent) return;
    if (code !== 0) return res.json({ voices: [] });
    // Parse "Name: en-US-AriaNeural\nGender: Female\n..." blocks
    const voices = [];
    const blocks = output.split('\n\n');
    for (const block of blocks) {
      const nameLine = block.match(/^Name:\s*(.+)$/m);
      const genderLine = block.match(/^Gender:\s*(.+)$/m);
      const localeLine = block.match(/^Locale:\s*(.+)$/m);
      if (nameLine) {
        voices.push({
          name: nameLine[1].trim(),
          gender: genderLine ? genderLine[1].trim() : '',
          locale: localeLine ? localeLine[1].trim() : '',
        });
      }
    }
    cachedVoices = voices;
    res.json({ voices });
  });
  proc.on('error', () => { if (!res.headersSent) res.json({ voices: [] }); });
});

// ---------------------------------------------------------------------------
// GET /api/supertonic-voices  — list Supertonic voice styles (cached)
// ---------------------------------------------------------------------------
let cachedSupertonicVoices = null;

app.get('/api/supertonic-voices', (req, res) => {
  if (cachedSupertonicVoices) return res.json({ voices: cachedSupertonicVoices });

  // First call may download the model; allow a generous timeout.
  const proc = spawn('python3', [
    '-c',
    "from supertonic import TTS;print('\\n'.join(TTS(auto_download=True).voice_style_names))",
  ], { timeout: 180000 });
  let output = '';
  proc.stdout.on('data', chunk => (output += chunk));
  proc.on('close', code => {
    if (res.headersSent) return;
    if (code !== 0) return res.json({ voices: [] });
    const voices = output.split('\n').map(s => s.trim()).filter(Boolean);
    if (voices.length) cachedSupertonicVoices = voices;
    res.json({ voices });
  });
  proc.on('error', () => { if (!res.headersSent) res.json({ voices: [] }); });
});

// ---------------------------------------------------------------------------
// GET /api/prereqs  — check system dependencies
// ---------------------------------------------------------------------------
app.get('/api/prereqs', async (req, res) => {
  const ollamaUrl = req.query.ollamaUrl || 'http://localhost:11434';
  const ttsProvider = req.query.ttsProvider || 'edge';
  const { execFile } = require('child_process');
  const util = require('util');
  const execFileP = util.promisify(execFile);

  async function checkBin(bin) {
    try { await execFileP('which', [bin]); return true; } catch { return false; }
  }

  async function checkOllama() {
    return new Promise(resolve => {
      let url;
      try { url = new URL(`${ollamaUrl}/api/tags`); } catch { return resolve(false); }
      const lib = url.protocol === 'https:' ? https : http;
      const req2 = lib.get(url.toString(), { timeout: 5000 }, r => resolve(r.statusCode === 200));
      req2.on('error', () => resolve(false));
      req2.on('timeout', () => { req2.destroy(); resolve(false); });
    });
  }

  async function checkEdgeTts() {
    try { await execFileP('edge-tts', ['--version']); return true; } catch { return false; }
  }

  async function checkMarp() {
    try {
      const { stdout } = await execFileP('npx', ['--yes', '@marp-team/marp-cli', '--version'], { timeout: 30000 });
      return stdout.trim().length > 0;
    } catch { return false; }
  }

  async function checkSupertonic() {
    try { await execFileP('python3', ['-c', 'import supertonic']); return true; } catch { return false; }
  }

  async function checkPyModule(mod) {
    try { await execFileP('python3', ['-c', `import ${mod}`]); return true; } catch { return false; }
  }

  const usingElevenLabs = ttsProvider === 'elevenlabs' || ttsProvider === 'elevenlabs-js';
  const usingSupertonic = ttsProvider === 'supertonic';

  const checks = [
    checkBin('soffice'),
    checkBin('pdftoppm'),
    checkBin('pdftotext'),
    checkBin('ffmpeg'),
    checkOllama(),
    checkMarp(),
    checkPyModule('docx'),     // python-docx — review/rewrite DOCX export
  ];
  if (usingSupertonic) checks.push(checkSupertonic());
  else if (!usingElevenLabs) checks.push(checkEdgeTts());

  const [soffice, pdftoppm, pdftotext, ffmpeg, ollama, marp, pydocx, ttsDep] = await Promise.all(checks);

  const results = [
    { name: 'soffice (LibreOffice)', ok: soffice, hint: 'sudo apt install libreoffice' },
    { name: 'pdftoppm (poppler)', ok: pdftoppm, hint: 'sudo apt install poppler-utils' },
    { name: 'pdftotext (poppler)', ok: pdftotext, hint: 'sudo apt install poppler-utils' },
    { name: 'ffmpeg', ok: ffmpeg, hint: 'sudo apt install ffmpeg' },
    { name: `Ollama (${ollamaUrl})`, ok: ollama, hint: 'Run: ollama serve' },
    { name: 'Marp CLI (Markdown slides)', ok: marp, hint: 'npm i -g @marp-team/marp-cli' },
    { name: 'python-docx (DOCX export)', ok: pydocx, hint: 'pip install python-docx' },
  ];

  if (usingSupertonic) {
    results.push({ name: 'supertonic (Python)', ok: ttsDep, hint: 'pip install supertonic' });
  } else if (usingElevenLabs) {
    results.push({ name: 'edge-tts (Python) — not needed for ElevenLabs', ok: true, hint: '' });
  } else {
    results.push({ name: 'edge-tts (Python)', ok: ttsDep, hint: 'pip install edge-tts python-pptx' });
  }

  res.json({ results });
});

// ---------------------------------------------------------------------------
// GET /api/elevenlabs-voices  — proxy ElevenLabs voice list (key in header)
// ---------------------------------------------------------------------------
app.get('/api/elevenlabs-voices', (req, res) => {
  const apiKey = req.headers['x-elevenlabs-key'] || '';
  if (!apiKey) return res.status(400).json({ error: 'x-elevenlabs-key header required' });

  const request = https.get(
    'https://api.elevenlabs.io/v1/voices',
    { headers: { 'xi-api-key': apiKey }, timeout: 10000 },
    resp => {
      let data = '';
      resp.on('data', chunk => (data += chunk));
      resp.on('end', () => {
        if (resp.statusCode !== 200) {
          return res.status(resp.statusCode).json({ error: `ElevenLabs returned ${resp.statusCode}` });
        }
        try {
          const parsed = JSON.parse(data);
          const voices = (parsed.voices || []).map(v => ({
            voice_id: v.voice_id,
            name: v.name,
            category: v.category || '',
          }));
          res.json({ voices });
        } catch {
          res.status(502).json({ error: 'Invalid response from ElevenLabs' });
        }
      });
    }
  );
  request.on('error', err => { if (!res.headersSent) res.status(502).json({ error: err.message }); });
  request.on('timeout', () => { request.destroy(); if (!res.headersSent) res.status(504).json({ error: 'Request timed out' }); });
});

// ---------------------------------------------------------------------------
// POST /api/generate-music-prompt  — generate a music prompt from slide content
// ---------------------------------------------------------------------------
app.post('/api/generate-music-prompt', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No .pptx or .md file uploaded' });

  const {
    model = 'llama3.2:3b',
    ollamaUrl = 'http://localhost:11434',
    personaText = '',
    contextText = '',
  } = req.body;

  const inputPath = req.file.path;
  const outputPath = path.join(UPLOADS_DIR, `${req._jobId}-music-prompt.json`);

  const args = [
    SCRIPT_PATH,
    '--input', inputPath,
    '--output', outputPath,
    '--model', model,
    '--ollama-url', ollamaUrl,
    '--generate-music-prompt-only',
  ];
  if (personaText.trim()) args.push('--persona-text', personaText.trim());
  if (contextText.trim()) args.push('--context-text', contextText.trim());

  res.setTimeout(310000);

  const proc = spawn('python3', args);
  let stderr = '';
  proc.stderr.on('data', chunk => { stderr += chunk.toString(); });
  proc.on('error', err => {
    fs.unlink(inputPath, () => {});
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });
  proc.on('close', code => {
    fs.unlink(inputPath, () => {});
    if (code !== 0) {
      const detail = stderr.split('\n').filter(l => l.includes('ERROR') || l.includes('error')).join('; ') || stderr;
      return res.status(500).json({ error: 'Failed to generate music prompt', detail });
    }
    try {
      const result = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      fs.unlink(outputPath, () => {});
      res.json({ prompt: result.prompt });
    } catch (err) {
      res.status(500).json({ error: 'Failed to parse music prompt result' });
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/tts-preview  — synthesize a single narration for in-browser playback
// ---------------------------------------------------------------------------
app.post('/api/tts-preview', async (req, res) => {
  const {
    text = '',
    ttsProvider = 'edge',
    voice = 'en-US-AriaNeural',
    elApiKey = '',
    elVoiceId = 'pNInz6obpgDQGcFmaJgB',
    elModel = 'eleven_multilingual_v2',
    elStability = '0.5',
    elSimilarity = '0.75',
    elStyle = '0.0',
    elSpeed = '1.0',
    elSpeakerBoost = 'true',
    stVoice = 'M1',
    stLang = 'en',
    stSteps = '8',
    stSpeed = '1.0',
  } = req.body;

  if (!text.trim()) return res.status(400).json({ error: 'text is required' });

  const speakText = stripCuesForTTS(text, ttsProvider) || ' ';

  const tmpId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const tmpFile = path.join(UPLOADS_DIR, `preview_${tmpId}.mp3`);
  const cleanup = () => fs.unlink(tmpFile, () => {});

  const streamFile = () => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on('close', cleanup);
    stream.on('error', cleanup);
  };

  try {
    if (ttsProvider === 'elevenlabs' || ttsProvider === 'elevenlabs-js') {
      const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
      const client = new ElevenLabsClient({ apiKey: elApiKey });
      const response = await client.textToSpeech.convert(elVoiceId, {
        text: speakText,
        model_id: elModel,
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability:        parseFloat(elStability),
          similarity_boost: parseFloat(elSimilarity),
          style:            parseFloat(elStyle),
          speed:            parseFloat(elSpeed),
          use_speaker_boost: elSpeakerBoost !== 'false',
        },
      });
      const chunks = [];
      for await (const chunk of response) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      fs.writeFileSync(tmpFile, Buffer.concat(chunks));
      streamFile();
    } else if (ttsProvider === 'supertonic') {
      // Helper writes slide_001.wav into a scratch dir. Transcode it to MP3 so
      // browser playback matches the Edge/ElevenLabs path (a raw WAV blob does
      // not reliably decode via `new Audio(blobURL)` in every browser).
      const tmpDir = path.join(UPLOADS_DIR, `preview_${tmpId}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      const narrationsFile = path.join(tmpDir, 'narrations.json');
      fs.writeFileSync(narrationsFile, JSON.stringify([text.trim()]));
      const dirCleanup = () => fs.rm(tmpDir, { recursive: true, force: true }, () => {});
      try {
        await new Promise((resolve, reject) => {
          const proc = spawn('python3', [
            SUPERTONIC_SCRIPT_PATH,
            '--workdir', tmpDir, '--narrations', narrationsFile,
            '--voice', stVoice, '--lang', stLang,
            '--steps', String(stSteps), '--speed', String(stSpeed),
          ]);
          proc.on('close', code => code === 0 ? resolve() : reject(new Error(`supertonic_synth exited ${code}`)));
          proc.on('error', reject);
        });
        const wavPath = path.join(tmpDir, 'slide_001.wav');
        await runFFmpeg(['-y', '-i', wavPath, '-c:a', 'libmp3lame', '-b:a', '192k', tmpFile], () => {});
      } catch (err) {
        dirCleanup();
        throw err;
      }
      dirCleanup();
      streamFile();
    } else {
      await new Promise((resolve, reject) => {
        const proc = spawn('edge-tts', ['--voice', voice, '--text', speakText, '--write-media', tmpFile]);
        proc.on('close', code => code === 0 ? resolve() : reject(new Error(`edge-tts exited ${code}`)));
        proc.on('error', reject);
      });
      streamFile();
    }
  } catch (err) {
    cleanup();
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/narrate  — Phase 1: extract + render + narrate only (no TTS/assembly)
// ---------------------------------------------------------------------------
app.post('/api/narrate', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No .pptx or .md file uploaded' });

  const jobId = req._jobId;
  const {
    model = 'llama3.2:3b',
    ttsProvider = 'edge',
    voice = 'en-US-AriaNeural',
    pause = '1.0',
    dpi = '150',
    theme = 'default',
    ollamaUrl = 'http://localhost:11434',
    keepTemp = 'false',
    elApiKey = '',
    elVoiceId = 'pNInz6obpgDQGcFmaJgB',
    elModel = 'eleven_multilingual_v2',
    elStability = '0.5',
    elSimilarity = '0.75',
    elStyle = '0.0',
    elSpeed = '1.0',
    elSpeakerBoost = 'true',
    // Supertonic fields
    stVoice = 'M1',
    stLang = 'en',
    stSteps = '8',
    stSpeed = '1.0',
    personaText = '',
    contextText = '',
    animFps = '8',
    // Music fields
    musicEnabled = 'false',
    musicPrompt = '',
    musicDuration = '70',
    musicVolume = '-20',
  } = req.body;

  const inputPath = req.file.path;
  const outputPath = path.join(OUTPUTS_DIR, `${jobId}.mp4`);
  const manifestPath = path.join(OUTPUTS_DIR, `${jobId}-manifest.json`);

  const job = {
    id: jobId,
    status: 'running',
    logs: [],
    outputPath,
    inputPath,
    originalName: req.file.originalname,
    clients: new Set(),
    manifest: null,
    ttsOpts: {
      ttsProvider, voice,
      elApiKey, elVoiceId, elModel,
      elStability, elSimilarity, elStyle, elSpeed, elSpeakerBoost,
      stVoice, stLang, stSteps, stSpeed,
      pause: parseFloat(pause),
      keepTemp,
    },
    musicOpts: null,
    musicPath: null,
  };
  jobs.set(jobId, job);
  res.json({ jobId });

  if (musicEnabled === 'true' && musicPrompt.trim() && elApiKey) {
    job.musicOpts = {
      enabled: true,
      prompt: musicPrompt.trim(),
      duration: parseInt(musicDuration) || 70,
      volume: parseInt(musicVolume) || -20,
      apiKey: elApiKey,
    };
  }

  const isMarkdown = fileExtension(job.originalName) === '.md';

  function pushLog(line) {
    job.logs.push(line);
    for (const client of job.clients) {
      client.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
    }
  }

  function finish(status, error = null) {
    job.status = status;
    job.error = error;
    for (const client of job.clients) {
      client.write(`data: ${JSON.stringify({ type: 'done', status, error })}\n\n`);
      client.end();
    }
    fs.unlink(inputPath, () => {});
  }

  const args = [
    SCRIPT_PATH,
    '--input', inputPath,
    '--output', outputPath,
    '--model', model,
    '--pause', pause,
    '--dpi', dpi,
    '--anim-fps', animFps,
    '--ollama-url', ollamaUrl,
    '--manifest-output', manifestPath,
  ];
  if (isMarkdown) args.push('--theme', theme);
  if (keepTemp === 'true') args.push('--keep-temp');
  if (personaText.trim()) args.push('--persona-text', personaText.trim());
  if (contextText.trim()) args.push('--context-text', contextText.trim());

  const proc = spawn('python3', args);
  proc.stdout.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
  proc.stderr.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
  proc.on('error', err => finish('error', err.message));
  proc.on('close', async code => {
    if (code !== 0) return finish('error', `Python exited with code ${code}`);
    try {
      job.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      fs.unlink(manifestPath, () => {});
    } catch (err) {
      return finish('error', `Failed to read manifest: ${err.message}`);
    }
    if (job.musicOpts) {
      try {
        pushLog('Generating background music ...');
        const musicPath = path.join(OUTPUTS_DIR, `${job.id}-music.mp3`);
        await generateElevenLabsMusic(job.musicOpts.prompt, job.musicOpts.duration, job.musicOpts.apiKey, musicPath);
        job.musicPath = musicPath;
        pushLog('Background music ready.');
      } catch (err) {
        pushLog(`Music generation failed: ${err.message}`);
      }
    }
    finish('narrated');
  });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/:id/narrations  — return narrations array for review
// ---------------------------------------------------------------------------
app.get('/api/jobs/:id/narrations', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (!job.manifest) return res.status(400).json({ error: 'Narrations not yet available' });
  const narrations = job.manifest.narrations;
  res.json({ narrations, script: joinNarrationsToScript(narrations) });
});

// ---------------------------------------------------------------------------
// POST /api/jobs/:id/synthesize  — Phase 2: TTS + assembly with (edited) narrations
// ---------------------------------------------------------------------------
app.post('/api/jobs/:id/synthesize', async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (!job.manifest) return res.status(400).json({ error: 'No manifest — run /api/narrate first' });
  if (job.status === 'running') return res.status(409).json({ error: 'Job already running' });

  const { script, narrations: legacyNarrations, musicEnabled, musicVolume } = req.body;
  const slideCount = job.manifest.images.length;

  let narrations;
  if (typeof script === 'string' && script.trim()) {
    const parsed = parseScriptToNarrations(script, slideCount);
    if (parsed.missing.length) {
      return res.status(400).json({
        error: `Script is missing narration for slide(s): ${parsed.missing.join(', ')}. ` +
               `Each slide needs a "## SLIDE N" header followed by narration.`,
      });
    }
    narrations = parsed.narrations;
  } else if (Array.isArray(legacyNarrations) && legacyNarrations.length) {
    if (legacyNarrations.length !== slideCount) {
      return res.status(400).json({
        error: `narrations length (${legacyNarrations.length}) does not match slide count (${slideCount})`,
      });
    }
    narrations = legacyNarrations;
  } else {
    return res.status(400).json({ error: 'Provide either a non-empty script or a narrations array' });
  }

  const { ttsOpts } = job;
  const speakable = narrations.map(n => stripCuesForTTS(n, ttsOpts.ttsProvider) || ' ');
  job.manifest.narrations = speakable;
  job.status = 'running';
  res.json({ ok: true });

  const { manifest } = job;

  function pushLog(line) {
    job.logs.push(line);
    for (const client of job.clients) {
      client.write(`data: ${JSON.stringify({ type: 'log', line })}\n\n`);
    }
  }

  function finish(status, error = null) {
    job.status = status;
    job.error = error;
    for (const client of job.clients) {
      client.write(`data: ${JSON.stringify({ type: 'done', status, error })}\n\n`);
      client.end();
    }
    if (ttsOpts.keepTemp !== 'true') fs.rm(manifest.work_dir, { recursive: true, force: true }, () => {});
  }

  try {
    pushLog('Synthesizing audio ...');
    if (ttsOpts.ttsProvider === 'elevenlabs' || ttsOpts.ttsProvider === 'elevenlabs-js') {
      await synthesizeElevenLabsSDKSlides(speakable, manifest.work_dir, {
        apiKey:       ttsOpts.elApiKey,
        voiceId:      ttsOpts.elVoiceId,
        modelId:      ttsOpts.elModel,
        stability:    ttsOpts.elStability,
        similarity:   ttsOpts.elSimilarity,
        style:        ttsOpts.elStyle,
        speed:        ttsOpts.elSpeed,
        speakerBoost: ttsOpts.elSpeakerBoost,
      }, pushLog);
    } else if (ttsOpts.ttsProvider === 'supertonic') {
      await synthesizeSupertonicSlides(narrations, manifest.work_dir, {
        voice: ttsOpts.stVoice,
        lang:  ttsOpts.stLang,
        steps: ttsOpts.stSteps,
        speed: ttsOpts.stSpeed,
      }, pushLog);
    } else {
      await synthesizeEdgeTTSSlides(speakable, manifest.work_dir, ttsOpts.voice, pushLog);
    }
    await assembleVideoFromManifest(manifest, job.outputPath, pushLog);
    const shouldMixMusic = musicEnabled !== false && musicEnabled !== 'false';
    if (shouldMixMusic && job.musicPath && fs.existsSync(job.musicPath)) {
      const mixedPath = job.outputPath.replace('.mp4', '-mixed.mp4');
      const volume = musicVolume !== undefined ? musicVolume : (job.musicOpts?.volume ?? -20);
      await mixMusicIntoVideo(job.outputPath, job.musicPath, volume, mixedPath, pushLog);
      fs.renameSync(mixedPath, job.outputPath);
      fs.unlink(job.musicPath, () => {});
      job.musicPath = null;
    }
    const sizeMb = (fs.statSync(job.outputPath).size / 1024 / 1024).toFixed(1);
    pushLog(`Done! Output: ${job.outputPath} (${sizeMb} MB)`);
    finish('done');
  } catch (err) {
    finish('error', err.message);
  }
});

// ===========================================================================
// REVIEW / REWRITE — bridged from the retired FastAPI reviewer via
// scripts/reviewer_synth.py (subprocess), reusing the same jobs Map + SSE infra.
// ===========================================================================

const REVIEW_EXTS = ['.pptx', '.pdf', '.docx', '.doc', '.odt', '.md', '.markdown', '.txt'];

function reviewFileExtension(filename) {
  const lower = (filename || '').toLowerCase();
  return REVIEW_EXTS.find(ext => lower.endsWith(ext)) || null;
}

const reviewUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename(req, file, cb) {
      const id = makeJobId();
      req._jobId = id;
      cb(null, `${id}${reviewFileExtension(file.originalname) || '.bin'}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (reviewFileExtension(file.originalname)) return cb(null, true);
    cb(new Error(`Unsupported file type. Accepted: ${REVIEW_EXTS.join(', ')}`));
  },
});

function personaDisplayName(filename) {
  const base = filename.replace(/^\d+-/, '').replace(/-PERSONA\.md$/i, '').replace(/\.md$/, '');
  return base.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function docSlug(name) {
  const stem = path.basename(name, path.extname(name)).toLowerCase();
  return stem.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'document';
}

// Shared handler for POST /api/review and POST /api/rewrite.
function startReviewJob(mode) {
  return (req, res) => {
    const {
      personas = '',
      model = 'llama3.2:3b',
      ollamaUrl = 'http://localhost:11434',
      text = '',
      title = '',
      advise = '',
      context = '',
    } = req.body;

    const availablePersonas = new Set(
      fs.existsSync(PERSONAS_DIR)
        ? fs.readdirSync(PERSONAS_DIR).filter(f => /-PERSONA\.md$/i.test(f))
        : []
    );
    const selected = personas.split(',').map(s => s.trim()).filter(Boolean);
    const bad = selected.filter(p => !availablePersonas.has(p));
    if (!selected.length || bad.length) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: `Invalid persona selection: ${bad.join(', ') || '(empty)'}` });
    }

    let inputArgs;
    let fileName;
    let slug;
    if (req.file) {
      fileName = req.file.originalname;
      slug = docSlug(fileName);
      inputArgs = ['--input', req.file.path];
    } else if (text.trim()) {
      fileName = title.trim() || 'Pasted text';
      slug = title.trim() ? docSlug(fileName) : `pasted-${Date.now().toString(36)}`;
      inputArgs = ['--text', text.trim()];
    } else {
      return res.status(400).json({ error: 'Provide a file or pasted text' });
    }

    const jobId = req._jobId || makeJobId();
    const job = {
      id: jobId,
      status: 'running',
      logs: [],
      clients: new Set(),
      kind: mode,            // 'review' | 'rewrite'
      docSlug: slug,
      fileName,
      error: null,
      personas: selected.map(f => ({
        file: f, slug: f.replace(/\.md$/i, '').toLowerCase(),
        name: personaDisplayName(f), state: 'queued',
      })),
      reports: [],
    };
    jobs.set(jobId, job);
    res.json({ jobId, docSlug: slug });

    // Background context (typed + attached file) → a temp file passed to Python.
    let contextPath = null;
    if (context.trim()) {
      contextPath = path.join(UPLOADS_DIR, `context-${jobId}.txt`);
      try { fs.writeFileSync(contextPath, context); } catch { contextPath = null; }
    }

    const broadcast = (payload) => {
      for (const client of job.clients) client.write(`data: ${JSON.stringify(payload)}\n\n`);
    };
    const pushLog = (line) => { job.logs.push(line); broadcast({ type: 'log', line }); };
    const finish = (status, error = null) => {
      job.status = status;
      job.error = error;
      broadcast({ type: 'done', status, error });
      for (const client of job.clients) client.end();
      if (req.file) fs.unlink(req.file.path, () => {});
      if (contextPath) fs.unlink(contextPath, () => {});
    };

    const handleLine = (line) => {
      let m;
      if (line.startsWith('@@SLUG ')) {
        job.docSlug = line.slice(7).trim();
        broadcast({ type: 'slug', slug: job.docSlug });
      } else if ((m = line.match(/^@@STATE persona=(\S+) state=(\S+)/))) {
        const p = job.personas.find(x => x.slug === m[1]);
        if (p) p.state = m[2];
        broadcast({ type: 'persona', slug: m[1], state: m[2] });
      } else if ((m = line.match(/^@@REPORT slug=(\S+) name=(.+)$/))) {
        if (!job.reports.find(r => r.slug === m[1])) job.reports.push({ slug: m[1], name: m[2].trim() });
        broadcast({ type: 'report', slug: m[1], name: m[2].trim() });
      } else if ((m = line.match(/^@@DONE state=(\S+)(?: error=(.*))?$/))) {
        job._finalState = m[1];
        job._finalError = m[2] ? m[2].trim() : null;
      } else {
        pushLog(line);
      }
    };

    const args = [
      REVIEWER_SCRIPT_PATH, 'run',
      ...inputArgs,
      '--file-name', fileName,
      '--slug', slug,
      '--personas', selected.join(','),
      '--model', model,
      '--mode', mode,
      '--ollama-url', ollamaUrl,
    ];
    if (mode === 'rewrite' && (advise === '1' || advise === 'true')) args.push('--advise');
    if (contextPath) args.push('--context-file', contextPath);
    const proc = spawn('python3', args);
    proc.stdout.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(handleLine));
    proc.stderr.on('data', chunk => chunk.toString().split('\n').filter(Boolean).forEach(pushLog));
    proc.on('error', err => finish('error', err.message));
    proc.on('close', code => {
      if (job._finalState === 'error') return finish('error', job._finalError || 'Review failed');
      if (code !== 0 && job._finalState !== 'complete') return finish('error', `Process exited with code ${code}`);
      finish('done');
    });
  };
}

app.post('/api/review', reviewUpload.single('file'), startReviewJob('review'));
app.post('/api/rewrite', reviewUpload.single('file'), startReviewJob('rewrite'));

// Snapshot of a review job's current state (personas, reports, status).
app.get('/api/reviews/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || !job.kind) return res.status(404).json({ error: 'Review job not found' });
  res.json({
    id: job.id, status: job.status, error: job.error, kind: job.kind,
    docSlug: job.docSlug, fileName: job.fileName,
    personas: job.personas, reports: job.reports,
  });
});

// List finished report markdown for a doc slug (synthesis first).
app.get('/api/reviews/:slug/reports', (req, res) => {
  const slug = req.params.slug;
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ error: 'Invalid slug' });
  const dir = path.join(REVIEWS_DIR, slug);
  if (!fs.existsSync(dir)) return res.json({ reports: [] });
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== '_extracted.md');
  files.sort((a, b) => (a === '00-SYNTHESIS.md' ? -1 : b === '00-SYNTHESIS.md' ? 1 : a.localeCompare(b)));
  const reports = files.map(f => {
    const stem = f.replace(/\.md$/, '');
    let name;
    if (f === '00-SYNTHESIS.md') name = 'Synthesis';
    else if (stem.startsWith('rewrite-')) name = personaDisplayName(stem.replace(/^rewrite-/, '')) + ' Rewrite';
    else name = personaDisplayName(stem);
    return { slug: stem, name, content: fs.readFileSync(path.join(dir, f), 'utf8') };
  });
  res.json({ reports });
});

// Overwrite a report's markdown (e.g. after accepting draft recommendations),
// so subsequent exports use the edited content.
app.post('/api/reviews/:slug/:report', (req, res) => {
  const { slug, report } = req.params;
  const { content } = req.body || {};
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+$/i.test(report)) {
    return res.status(400).json({ error: 'Invalid report reference' });
  }
  if (typeof content !== 'string') return res.status(400).json({ error: 'Missing content' });
  const name = report.toLowerCase() === '00-synthesis' ? '00-SYNTHESIS.md' : `${report}.md`;
  const mdPath = path.join(REVIEWS_DIR, slug, name);
  if (!fs.existsSync(mdPath)) return res.status(404).json({ error: 'Report not found' });
  fs.writeFileSync(mdPath, content.endsWith('\n') ? content : content + '\n');
  res.json({ ok: true });
});

// Export a finished report to DOCX or PPTX via the Python helper.
app.get('/api/export/:slug/:report.:format(docx|pptx)', (req, res) => {
  const { slug, report, format } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+$/i.test(report)) {
    return res.status(400).json({ error: 'Invalid report reference' });
  }
  if (format === 'pptx' && !report.startsWith('rewrite-')) {
    return res.status(400).json({ error: 'Only rewrite reports can be exported to PPTX' });
  }
  const name = report.toLowerCase() === '00-synthesis' ? '00-SYNTHESIS.md' : `${report}.md`;
  const mdPath = path.join(REVIEWS_DIR, slug, name);
  if (!fs.existsSync(mdPath)) return res.status(404).json({ error: 'Report not found' });

  const outPath = path.join(UPLOADS_DIR, `export-${makeJobId()}.${format}`);
  const proc = spawn('python3', [REVIEWER_SCRIPT_PATH, 'export', '--format', format, '--input', mdPath, '--output', outPath]);
  let stderr = '';
  proc.stderr.on('data', d => (stderr += d));
  proc.on('error', err => res.status(500).json({ error: err.message }));
  proc.on('close', code => {
    if (code !== 0 || !fs.existsSync(outPath)) {
      return res.status(500).json({ error: `Export failed: ${stderr || 'code ' + code}` });
    }
    const mime = format === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-${report}.${format}"`);
    fs.createReadStream(outPath).pipe(res).on('close', () => fs.unlink(outPath, () => {}));
  });
});

if (fs.existsSync(DIST_DIR)) {
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`pptx-video-web server → http://0.0.0.0:${PORT}`);
  console.log(`Script path: ${SCRIPT_PATH}`);
});
