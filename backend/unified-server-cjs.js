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
const { balanceTeams, validateTeamAssignment } = require('./dist/src/teamBalancer');
const { generateFormations } = require('./dist/src/formationGenerator');

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

// Generate a random 8-character alphanumeric token for player self-removal
function generateRemovalToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
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
    // Retry Supabase connection up to 3 times to handle transient cold-start network issues
    // (both Render and Supabase free tier can have startup delays simultaneously)
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const players = await supabaseStore.getPlayers();
        console.log(`✅ Supabase store verified (attempt ${attempt}) — ${players.length} players today`);
        activeStore = supabaseStore;
        return;
      } catch (e) {
        console.error(`⚠️  Supabase init attempt ${attempt}/${MAX_RETRIES} failed: ${e.message}`);
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // 2s, 4s backoff
        } else {
          throw e; // rethrow after final attempt
        }
      }
    }
  } catch (e) {
    console.error('❌ Supabase store unavailable after all retries — degraded file-store mode:', e.message);
    console.error('⚠️  WARNING: Data will NOT persist across restarts in this mode.');
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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
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

function buildMatchSchedule(teams) {
  const captainTeams = teams.filter(team => team.captainName);
  if (captainTeams.length < 4) {
    return [];
  }

  const [teamA, teamB, teamC, teamD] = captainTeams;
  const slots = [
    {
      title: 'Slot 1 (8:30 AM - 9:15 AM)',
      matches: [
        `${teamA.captainName}'s ${teamA.name} vs ${teamC.captainName}'s ${teamC.name}`,
        `${teamB.captainName}'s ${teamB.name} vs ${teamD.captainName}'s ${teamD.name}`
      ]
    },
    {
      title: 'Slot 2 (9:15 AM - 10:00 AM)',
      matches: [
        `${teamA.captainName}'s ${teamA.name} vs ${teamD.captainName}'s ${teamD.name}`,
        `${teamB.captainName}'s ${teamB.name} vs ${teamC.captainName}'s ${teamC.name}`
      ]
    }
  ];

  return slots;
}

function buildUiTeamPayload(result) {
  if (result.mode === 'four-team') {
    const teams = result.teams.map((team, index) => ({
      name: team.name,
      displayName: `${team.captainName ? `${team.captainName}'s ` : ''}${team.name}`,
      color: index < 2 ? 'red' : 'blue',
      captainName: team.captainName,
      players: team.players.map(player => ({ name: player.name }))
    }));

    return {
      mode: 'four-team',
      teams,
      captainsNote: 'Note: Team captains are randomly selected to lead coordination and are responsible for ensuring soccer balls and goal posts are ready and available before the game.',
      schedule: buildMatchSchedule(teams)
    };
  }

  return {
    mode: 'two-team',
    teams: [
      {
        name: result.team1.name,
        displayName: result.team1.name,
        color: 'blue',
        captainName: result.team1.captainName,
        players: result.team1.players.map(player => ({ name: player.name }))
      },
      {
        name: result.team2.name,
        displayName: result.team2.name,
        color: 'red',
        captainName: result.team2.captainName,
        players: result.team2.players.map(player => ({ name: player.name }))
      }
    ]
  };
}

function buildPlayers(names) {
  // One entry per player: names differing only by case resolve to the same DB player
  const seen = new Set();
  const players = [];
  for (const name of names) {
    const player = getPlayerByName(name) || { name, rating: 5.0, position: 'player' };
    const key = player.name.toLowerCase();
    if (seen.has(key)) {
      console.warn(`⚠️ Ignoring duplicate player entry: ${name}`);
      continue;
    }
    seen.add(key);
    players.push(player);
  }
  return players;
}

async function generateTeamsForToday(source = 'manual') {
  await ensureDailyReset();

  const store = getPersistentStore();

  // Guard: never overwrite already-formed teams.
  // This prevents the cron (or any concurrent caller) from wiping formed teams
  // by calling markInsufficient() when players have already been cleared after formation.
  const existingStatus = await Promise.resolve(store.getDailyStatus());
  if (existingStatus === 'formed') {
    console.log(`ℹ️ Teams already formed today — skipping generation (source: ${source})`);
    return { ok: true, result: await Promise.resolve(store.getFormedTeams()) };
  }

  const names = await Promise.resolve(store.getPlayers());
  if (names.length < MIN_PLAYERS) {
    await Promise.resolve(store.markInsufficient());
    return { ok: false, error: `Not enough players to form teams. Need at least ${MIN_PLAYERS}.`, count: names.length };
  }

  const players = buildPlayers(names);
  let result;
  try {
    result = balanceTeams(players);
  } catch (e) {
    console.error('❌ Team balancing failed:', e.message);
    return { ok: false, error: 'Team generation failed. Please try again.', count: names.length };
  }
  
  const formationPlayers = result.mode === 'four-team'
    ? [result.team1.players, result.team2.players, result.team3.players, result.team4.players]
    : [result.team1.players, result.team2.players];
  const formations = generateFormations(...formationPlayers);

  const normalized = {
    ...result,
    team1: {
      ...result.team1,
      name: result.mode === 'four-team' ? 'Red Team A' : 'Blue Team',
      players: sortPlayersByName(result.team1.players)
    },
    team2: {
      ...result.team2,
      name: result.mode === 'four-team' ? 'Red Team B' : 'Red Team',
      players: sortPlayersByName(result.team2.players)
    },
    team3: result.team3 ? {
      ...result.team3,
      name: 'Blue Team A',
      players: sortPlayersByName(result.team3.players)
    } : undefined,
    team4: result.team4 ? {
      ...result.team4,
      name: 'Blue Team B',
      players: sortPlayersByName(result.team4.players)
    } : undefined,
    formations,
    generatedFrom: source,
    generatedAt: new Date().toISOString(),
    ...buildUiTeamPayload(result)
  };

  // Last line of defence: what we persist and show must contain every player exactly once
  const finalTeams = [normalized.team1, normalized.team2, normalized.team3, normalized.team4].filter(Boolean);
  const problems = [
    ...validateTeamAssignment(players, finalTeams),
    ...validateTeamAssignment(players, normalized.teams || [])
  ];
  if (problems.length > 0) {
    console.error(`❌ Refusing to save invalid teams: ${problems.join(', ')}`);
    return { ok: false, error: 'Team generation produced an invalid result. Please try again.', count: names.length };
  }

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
        mode: formedTeams.mode || 'two-team',
        blueTeam: formedTeams.team1.players.map(p => p.name),
        redTeam: formedTeams.team2.players.map(p => p.name),
        groups: formedTeams.teams?.map(team => ({
          name: team.name,
          displayName: team.displayName,
          color: team.color,
          captainName: team.captainName,
          players: team.players.map((player) => player.name)
        })),
        captainsNote: formedTeams.captainsNote,
        schedule: formedTeams.schedule,
        generatedAt: formedTeams.generatedAt || null
      },
      formations: formedTeams.formations || null
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
    // Never reset formed teams when someone tries to join — that would silently
    // wipe the squad if a late join arrives right after auto-generation.
    // Use POST /api/reset (or /api/admin/reset) to explicitly start a new session.
    return res.status(400).json({ error: 'Join is closed for today. Teams already finalized.' });
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
  
  // Generate removal token only for single-player joins
  // Multi-player joins (captain adding others) skip token generation - admin handles removal
  let token = null;
  if (requestedNames.length === 1) {
    token = generateRemovalToken();
    const playerName = requestedNames[0];
    await Promise.resolve(store.setPlayerToken(playerName, token));
    console.log(`🔑 Generated removal token for ${playerName}: ${token}`);
  }
  
  res.json({ success: true, added: requestedNames.length, token });
});

app.post("/api/leave", async (req, res) => {
  // Only admins may remove a player — validate x-admin-key against ADMIN_SECRET
  const adminKey = req.headers['x-admin-key'];
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || adminKey !== adminSecret) {
    return res.status(403).json({ error: 'Unauthorized: admin access required to remove players' });
  }

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

// Self-removal endpoint - allows players to remove themselves using a token
app.post("/api/remove-self", async (req, res) => {
  await ensureDailyReset();
  const store = getPersistentStore();
  const { name, token } = req.body;

  if (!name || !token) {
    return res.status(400).json({ error: 'Player name and removal code are required.' });
  }

  // Validate the token
  const isValid = await Promise.resolve(store.validatePlayerToken(name, token));
  if (!isValid) {
    return res.status(403).json({ error: 'Invalid removal code. Please check your code or contact an admin for assistance.' });
  }

  // Check if player is actually in the list
  const currentPlayers = await Promise.resolve(store.getPlayers());
  if (!currentPlayers.includes(name)) {
    return res.status(404).json({ error: 'Player not found in current game.' });
  }

  // Remove the player and their token
  await runMutation(async () => {
    await Promise.resolve(store.removePlayer(name));
  });

  console.log(`🗑️ Player ${name} removed themselves using removal token`);

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true, message: 'You have been removed from the game.' });
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

// 🔐 Verify admin key — used by the frontend to decide whether to show remove buttons
// Returns 200 {valid: true} only if x-admin-key matches ADMIN_SECRET
app.get('/api/admin/verify', (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(503).json({ valid: false, reason: 'ADMIN_SECRET not configured' });
  }
  const provided = req.headers['x-admin-key'];
  if (provided && provided === adminSecret) {
    return res.json({ valid: true });
  }
  return res.status(403).json({ valid: false });
});

// 🔐 Admin reset — protected by ADMIN_SECRET env var, works in any environment
// Usage: POST /api/admin/reset  with header  x-admin-secret: <ADMIN_SECRET>
app.post('/api/admin/reset', async (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(503).json({ error: 'Admin reset is not configured (ADMIN_SECRET not set).' });
  }
  const provided = req.headers['x-admin-secret'];
  if (!provided || provided !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const store = getPersistentStore();
  await Promise.resolve(store.resetForNewDay());
  console.log('🔐 Admin reset performed');
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

// 🧹 Only today's data is relevant: purge all earlier daily_data rows.
// Runs at startup (clears any backlog), shortly after local midnight, and whenever a new
// day's row is created (see supabaseStore.createNewDay) so a sleeping host still self-cleans.
const CLEANUP_CRON = process.env.CLEANUP_CRON || '5 0 * * *';

async function purgeOldDailyData(trigger) {
  if (activeStore !== supabaseStore) return;
  try {
    const deleted = await supabaseStore.purgeOldData();
    console.log(`🧹 Cleanup (${trigger}): removed ${deleted} old row(s)`);
  } catch (e) {
    console.error(`⚠️ Cleanup (${trigger}) failed (non-fatal):`, e.message);
  }
}

cron.schedule(CLEANUP_CRON, () => purgeOldDailyData('cron'), { timezone: TIMEZONE });

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
  purgeOldDailyData('startup');
  app.listen(PORT, () => {
    console.log(`🚀 Unified Soccer Bot running on port ${PORT}`);
    console.log(`⚽ Team generation cron: ${TEAM_GENERATION_CRON} (${TIMEZONE})`);
    console.log(`🧪 Manual generate enabled: ${ENABLE_MANUAL_GENERATE}`);
    console.log(`💾 Active store: ${activeStore === supabaseStore ? 'Supabase' : 'File'}`);
  });
});
// Deploy trigger Thu Mar 26 01:10:11 EDT 2026
