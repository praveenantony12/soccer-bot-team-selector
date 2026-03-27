const express = require('express');
const cors = require('cors');
const { join } = require('path');
const { existsSync } = require('fs');
const cron = require('node-cron');
try {
  const dotenv = require('dotenv');
  const { existsSync: _exists } = require('fs');
  const { join: _join } = require('path');
  const localEnv = _join(__dirname, '.env.local');
  if (_exists(localEnv)) {
    dotenv.config({ path: localEnv, override: true });
    console.log('🔧 Loaded .env.local (local dev)');
  } else {
    dotenv.config();
    console.log('🔧 Loaded .env (production/Render)');
  }
} catch (error) {
  console.log('ℹ️ dotenv not installed, using process environment variables');
}

// Import backend functionality
const { persistentStore } = require('./dist/src/persistentStore');
const { supabaseStore } = require('./dist/src/supabaseStore');
const { getAllPlayerNames, getPlayerByName } = require('./dist/src/players');
const { balanceTeams } = require('./dist/src/teamBalancer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TIMEZONE = process.env.TEAM_TIMEZONE || 'America/New_York';
const MIN_PLAYERS = Number(process.env.MIN_PLAYERS_TO_FORM_TEAMS || 12);
const TEAM_GENERATION_CRON = process.env.TEAM_GENERATION_CRON || '30 19 * * *';
const ENABLE_MANUAL_GENERATE =
  process.env.ENABLE_MANUAL_GENERATE === 'true' || process.env.NODE_ENV !== 'production';

let mutationQueue = Promise.resolve();

function runMutation(task) {
  const next = mutationQueue.then(task, task);
  mutationQueue = next.catch(() => undefined);
  return next;
}

// Determined once at startup — avoids re-checking env vars on every request
let activeStore = persistentStore;

async function initActiveStore() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('📁 Supabase credentials not set — using file-based persistent store');
    activeStore = persistentStore;
    return;
  }

  try {
    // Force initialization to complete and verify it actually works
    const players = await supabaseStore.getPlayers();
    console.log(`✅ Supabase store verified — using Supabase for persistence (${players.length} players today)`);
    activeStore = supabaseStore;
  } catch (e) {
    console.error('❌ Supabase store init failed, falling back to file storage:', e.message);
    activeStore = persistentStore;
  }
}

function getPersistentStore() {
  return activeStore;
}

// Parse cutoff time from TEAM_GENERATION_CRON
function parseCutoffTimeFromCron() {
  const cronParts = TEAM_GENERATION_CRON.split(' ');
  const minute = parseInt(cronParts[0]) || 30;
  const hour = parseInt(cronParts[1]) || 19;
  return { hour, minute };
}

// Helper function to format cutoff time label dynamically with proper timezone conversion
function formatCutoffTimeLabel() {
  const { hour, minute } = parseCutoffTimeFromCron();
  
  // Create a date object for "today" at that UTC hour/minute
  const date = new Date();
  date.setUTCHours(hour, minute, 0, 0);

  // Use Intl.DateTimeFormat to show the time in the server's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIMEZONE,
    timeZoneName: 'short'
  });
  
  const formatted = formatter.format(date);
  // Extract time and timezone parts (e.g., "11:00 PM EDT" from "3/25/2026, 11:00 PM EDT")
  const timeMatch = formatted.match(/(\d{1,2}:\d{2}\s[AP]M)\s([A-Z]{3,4})/);
  return timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : formatted;
}

// ✅ Enable CORS - More permissive for development
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ["GET","POST"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔄 API Routes - MUST come before static files
app.get("/api/players", (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json(getAllPlayerNames());
});

async function ensureDailyReset() {
  try {
    const store = getPersistentStore();
    const lastReset = await Promise.resolve(store.getLastResetKey());
    const todayKey = store.getTodayKey();
    if (lastReset !== todayKey) {
      console.log(`🔄 New day detected (last: ${lastReset}, today: ${todayKey}), resetting`);
      await Promise.resolve(store.resetForNewDay());
    }
  } catch (e) {
    console.error('⚠️ ensureDailyReset error (non-fatal):', e.message);
  }
}

function isAfterCutoffNow() {
  // TEAM_GENERATION_CRON is expressed in UTC — compare against UTC time
  const { hour: cutoffHour, minute: cutoffMinute } = parseCutoffTimeFromCron();
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  if (utcHour > cutoffHour) return true;
  if (utcHour < cutoffHour) return false;
  return utcMinute >= cutoffMinute;
}

function sortPlayersByName(players) {
  return [...players].sort((a, b) => a.name.localeCompare(b.name));
}

function buildPlayers(names) {
  return names.map(name => {
    const player = getPlayerByName(name);
    if (!player) {
      return { name, rating: 5.0, position: 'player' };
    }
    return player;
  });
}

async function generateTeamsForToday(source = 'manual') {
  await ensureDailyReset();

  const store = getPersistentStore();
  const names = await Promise.resolve(store.getPlayers());
  if (names.length < MIN_PLAYERS) {
    await Promise.resolve(store.markInsufficient());
    return { ok: false, error: `Not enough players to form teams. Need at least ${MIN_PLAYERS}.`, count: names.length };
  }

  const players = buildPlayers(names);
  const result = balanceTeams(players);

  const normalized = {
    ...result,
    team1: {
      ...result.team1,
      name: 'Blue Team',
      players: sortPlayersByName(result.team1.players)
    },
    team2: {
      ...result.team2,
      name: 'Red Team',
      players: sortPlayersByName(result.team2.players)
    },
    generatedFrom: source,
    generatedAt: new Date().toISOString()
  };

  await Promise.resolve(store.saveTeams(normalized));
  await Promise.resolve(store.clearPlayers());

  return { ok: true, result: normalized };
}

async function getUiState() {
  await ensureDailyReset();
  
  const store = getPersistentStore();
  
  // Check if teams should be generated automatically (cron backup)
  const dailyStatusNow = await Promise.resolve(store.getDailyStatus());
  if (!ENABLE_MANUAL_GENERATE && isAfterCutoffNow() && dailyStatusNow === 'collecting') {
    console.log('🔄 Auto-generating teams (cron backup check)');
    const generated = await generateTeamsForToday('cron-backup');
    if (generated.ok) {
      console.log('✅ Teams generated via cron backup');
    }
  }

  // Re-fetch status after potential team generation
  const dailyStatus = await Promise.resolve(store.getDailyStatus());
  const formedTeams = await Promise.resolve(store.getFormedTeams());

  if (dailyStatus === 'formed' && formedTeams) {
    return {
      phase: 'formed',
      minPlayers: MIN_PLAYERS,
      cutoffTimeLabel: formatCutoffTimeLabel(),
      canGenerateNow: ENABLE_MANUAL_GENERATE,
      teams: {
        blueTeam: formedTeams.team1.players.map(p => p.name),
        redTeam: formedTeams.team2.players.map(p => p.name),
        generatedAt: formedTeams.generatedAt || null
      }
    };
  }

  if (dailyStatus === 'insufficient') {
    return {
      phase: 'insufficient',
      minPlayers: MIN_PLAYERS,
      cutoffTimeLabel: formatCutoffTimeLabel(),
      canGenerateNow: ENABLE_MANUAL_GENERATE,
      message: `Not enough players to form teams. Need at least ${MIN_PLAYERS}.`
    };
  }

  return {
    phase: 'collecting',
    minPlayers: MIN_PLAYERS,
    cutoffTimeLabel: formatCutoffTimeLabel(),
    canGenerateNow: ENABLE_MANUAL_GENERATE
  };
}

app.get("/api/current", async (req, res) => {
  await ensureDailyReset();
  const store = getPersistentStore();
  const currentPlayers = await Promise.resolve(store.getPlayers());

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json(currentPlayers);
});

app.post("/api/join", async (req, res) => {
  await ensureDailyReset();
  const store = getPersistentStore();
  const { name, names } = req.body;

  const requestedNames = Array.isArray(names)
    ? names.filter(player => typeof player === 'string')
    : [name].filter(player => typeof player === 'string');

  if (requestedNames.length === 0) {
    return res.status(400).json({ error: 'Player name is required.' });
  }

  const dailyStatus = await Promise.resolve(store.getDailyStatus());
  if (dailyStatus === 'formed') {
    if (ENABLE_MANUAL_GENERATE) {
      await Promise.resolve(store.resetForNewDay());
    } else {
      return res.status(400).json({ error: 'Join is closed for today. Teams already finalized.' });
    }
  }

  try {
    await runMutation(async () => {
      for (const playerName of requestedNames) {
        await Promise.resolve(store.addPlayer(playerName));
      }
    });
  } catch (error) {
    console.error('❌ Failed to persist join request:', error);
    return res.status(500).json({ success: false, error: 'Failed to persist players' });
  }

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true, added: requestedNames.length });
});

app.post("/api/leave", async (req, res) => {
  await ensureDailyReset();
  const store = getPersistentStore();
  const { name } = req.body;
  await runMutation(async () => {
    await Promise.resolve(store.removePlayer(name));
  });
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true });
});

app.get("/api/teams", async (req, res) => {
  await ensureDailyReset();
  const store = getPersistentStore();
  const formedTeams = await Promise.resolve(store.getFormedTeams());
  if (formedTeams) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    return res.json(formedTeams);
  }
  return res.json({ error: 'Teams not formed yet' });
});

app.get('/api/ui-state', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  return res.json(await getUiState());
});

// 🔧 Manual team generation (for testing)
app.post("/api/teams/generate", async (req, res) => {
  if (!ENABLE_MANUAL_GENERATE) {
    return res.status(403).json({ error: 'Manual team generation is disabled.' });
  }

  const generated = await generateTeamsForToday('manual-button');
  if (!generated.ok) {
    return res.status(400).json({ error: generated.error, count: generated.count });
  }

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true, teams: generated.result });
});

// 🔧 Debug endpoint - always allows manual generation (bypasses ENABLE_MANUAL_GENERATION)
app.post("/api/teams/generate-debug", async (req, res) => {
  console.log('🔧 Debug manual generation triggered');
  const generated = await generateTeamsForToday('debug-button');
  if (!generated.ok) {
    return res.status(400).json({ error: generated.error, count: generated.count });
  }

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true, teams: generated.result });
});

// 🔧 Dev-only: reset today's state back to collecting
app.post('/api/reset', async (req, res) => {
  if (!ENABLE_MANUAL_GENERATE) {
    return res.status(403).json({ error: 'Reset is disabled in production.' });
  }
  const store = getPersistentStore();
  await Promise.resolve(store.resetForNewDay());
  res.json({ success: true, message: 'State reset to collecting.' });
});

app.get("/api/health", async (req, res) => {
  await ensureDailyReset();
  const store = getPersistentStore();
  const players = await Promise.resolve(store.getPlayers());
  const phase = await Promise.resolve(store.getDailyStatus());
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    players: Array.isArray(players) ? players.length : 0,
    phase
  });
});

// 📁 Serve frontend static files - MUST come after API routes
const frontendPath = join(__dirname, '../dist/soccer-bot-team-selector/browser');
const frontendIndexPath = join(frontendPath, 'index.html');
const hasBuiltFrontend = existsSync(frontendIndexPath);

if (hasBuiltFrontend) {
  app.use(express.static(frontendPath));
}

// 🏠 Serve frontend for all other routes (must be last)
app.get('*', (req, res) => {
  // Don't intercept API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  if (!hasBuiltFrontend) {
    return res.status(404).json({
      error: 'Frontend build not found. Run frontend with ng serve on :4200 or build with npm run build:prod.'
    });
  }

  res.sendFile(frontendIndexPath);
});

// 🕢 Team generation at cutoff time (configurable)
// IMPORTANT: { timezone: 'UTC' } ensures the cron expression is always
// interpreted as UTC regardless of the server's TZ env var (e.g. TZ=America/New_York on Render).
cron.schedule(TEAM_GENERATION_CRON, async () => {
  console.log('⏰ Cron triggered at:', new Date().toISOString());
  console.log('⏰ Cron schedule (UTC):', TEAM_GENERATION_CRON);
  console.log('⏰ Display timezone:', TIMEZONE);
  console.log('Generating teams at cutoff...');
  const generated = await generateTeamsForToday('cron');
  if (!generated.ok) {
    console.log(`❌ ${generated.error} (current: ${generated.count})`);
    return;
  }
  console.log('✅ Teams generated successfully via cron');
}, { timezone: 'UTC' });

// Debug: Check current time vs cutoff every minute
setInterval(() => {
  const now = new Date();
  const { hour: cutoffHour, minute: cutoffMinute } = parseCutoffTimeFromCron();
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  console.log(
    `🕐 Current: ${localNow.getHours()}:${localNow.getMinutes().toString().padStart(2, '0')} ${TIMEZONE}` +
    ` | UTC: ${now.getUTCHours()}:${now.getUTCMinutes().toString().padStart(2, '0')}` +
    ` | Cutoff (UTC): ${cutoffHour}:${cutoffMinute.toString().padStart(2, '0')}` +
    ` | After cutoff: ${isAfterCutoffNow()}`
  );
}, 60000); // Check every minute

// Initialise the store, then start listening
initActiveStore().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Unified Soccer Bot running on port ${PORT}`);
    console.log(`⚽ Team generation cron: ${TEAM_GENERATION_CRON} (${TIMEZONE})`);
    console.log(`🧪 Manual generate enabled: ${ENABLE_MANUAL_GENERATE}`);
    console.log(`💾 Active store: ${activeStore === supabaseStore ? 'Supabase' : 'File'}`);
  });
});
// Deploy trigger Thu Mar 26 01:10:11 EDT 2026
