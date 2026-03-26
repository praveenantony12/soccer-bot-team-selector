const express = require('express');
const cors = require('cors');
const { join } = require('path');
const { existsSync } = require('fs');
const cron = require('node-cron');

// Import backend functionality
const { persistentStore } = require('./dist/src/persistentStore');
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

function ensureDailyReset() {
  if (persistentStore.getLastResetKey() !== persistentStore.getTodayKey()) {
    persistentStore.resetForNewDay();
  }
}

function isAfterCutoffNow() {
  const { hour: cutoffHour, minute: cutoffMinute } = parseCutoffTimeFromCron();
  const easternNow = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
  if (easternNow.getHours() > cutoffHour) return true;
  if (easternNow.getHours() < cutoffHour) return false;
  return easternNow.getMinutes() >= cutoffMinute;
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

function generateTeamsForToday(source = 'manual') {
  ensureDailyReset();

  const names = persistentStore.getPlayers();
  if (names.length < MIN_PLAYERS) {
    persistentStore.markInsufficient();
    return {
      ok: false,
      error: `Not enough players to form teams. Need at least ${MIN_PLAYERS}.`,
      count: names.length
    };
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

  persistentStore.saveTeams(normalized);
  persistentStore.clearPlayers();

  return { ok: true, result: normalized };
}

function getUiState() {
  ensureDailyReset();
  
  // Check if teams should be generated automatically (cron backup)
  if (!ENABLE_MANUAL_GENERATE && isAfterCutoffNow() && persistentStore.getDailyStatus() === 'collecting') {
    console.log('🔄 Auto-generating teams (cron backup check)');
    const generated = generateTeamsForToday('cron-backup');
    if (generated.ok) {
      console.log('✅ Teams generated via cron backup');
    }
  }

  const dailyStatus = persistentStore.getDailyStatus();
  const formedTeams = persistentStore.getFormedTeams();

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

app.get("/api/current", (req, res) => {
  ensureDailyReset();
  const currentPlayers = persistentStore.getPlayers();

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json(currentPlayers);
});

app.post("/api/join", (req, res) => {
  ensureDailyReset();
  const { name } = req.body;

  if (persistentStore.getDailyStatus() === 'formed') {
    if (ENABLE_MANUAL_GENERATE) {
      persistentStore.resetForNewDay();
    } else {
      return res.status(400).json({ error: 'Join is closed for today. Teams already finalized.' });
    }
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Player name is required.' });
  }

  persistentStore.addPlayer(name);
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true });
});

app.post("/api/leave", (req, res) => {
  ensureDailyReset();
  const { name } = req.body;
  persistentStore.removePlayer(name);
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ success: true });
});

app.get("/api/teams", (req, res) => {
  ensureDailyReset();
  const formedTeams = persistentStore.getFormedTeams();
  if (formedTeams) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    return res.json(formedTeams);
  }
  return res.json({ error: 'Teams not formed yet' });
});

app.get('/api/ui-state', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  return res.json(getUiState());
});

// 🔧 Manual team generation (for testing)
app.post("/api/teams/generate", (req, res) => {
  if (!ENABLE_MANUAL_GENERATE) {
    return res.status(403).json({ error: 'Manual team generation is disabled.' });
  }

  const generated = generateTeamsForToday('manual-button');
  if (!generated.ok) {
    return res.status(400).json({ error: generated.error, count: generated.count });
  }

  res.json(generated.result);
});

// 🔧 Dev-only: reset today's state back to collecting
app.post('/api/reset', (req, res) => {
  if (!ENABLE_MANUAL_GENERATE) {
    return res.status(403).json({ error: 'Reset is disabled in production.' });
  }
  persistentStore.resetForNewDay();
  res.json({ success: true, message: 'State reset to collecting.' });
});

app.get("/api/health", (req, res) => {
  ensureDailyReset();
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    players: persistentStore.getPlayers().length,
    phase: persistentStore.getDailyStatus()
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
cron.schedule(TEAM_GENERATION_CRON, async () => {
  console.log('⏰ Cron triggered at:', new Date().toISOString());
  console.log('⏰ Cron schedule:', TEAM_GENERATION_CRON);
  console.log('⏰ Timezone:', TIMEZONE);
  console.log('Generating teams at cutoff...');
  const generated = generateTeamsForToday('cron');
  if (!generated.ok) {
    console.log(`❌ ${generated.error} (current: ${generated.count})`);
    return;
  }
  console.log('✅ Teams generated successfully via cron');
});

// Debug: Check current time vs cutoff
setInterval(() => {
  const now = new Date();
  const { hour: cutoffHour, minute: cutoffMinute } = parseCutoffTimeFromCron();
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  console.log(`🕐 Current time: ${localNow.getHours()}:${localNow.getMinutes().toString().padStart(2, '0')} ${TIMEZONE}`);
  console.log(`🕐 Cutoff time: ${cutoffHour}:${cutoffMinute.toString().padStart(2, '0')} UTC`);
  console.log(`🕐 After cutoff: ${isAfterCutoffNow()}`);
}, 60000); // Check every minute

app.listen(PORT, () => {
  console.log(`🚀 Unified Soccer Bot running on port ${PORT}`);
  console.log(`⚽ Team generation cron: ${TEAM_GENERATION_CRON} (${TIMEZONE})`);
  console.log(`🧪 Manual generate enabled: ${ENABLE_MANUAL_GENERATE}`);
});
