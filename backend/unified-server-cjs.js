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
const CUTOFF_HOUR = Number(process.env.TEAM_CUTOFF_HOUR || 19); // 7 PM
const CUTOFF_MINUTE = Number(process.env.TEAM_CUTOFF_MINUTE || 30); // :30
const MIN_PLAYERS = Number(process.env.MIN_PLAYERS_TO_FORM_TEAMS || 12);
const TEAM_GENERATION_CRON = process.env.TEAM_GENERATION_CRON || '30 19 * * *';
const ENABLE_MANUAL_GENERATE =
  process.env.ENABLE_MANUAL_GENERATE === 'true' || process.env.NODE_ENV !== 'production';

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
  const easternNow = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
  if (easternNow.getHours() > CUTOFF_HOUR) return true;
  if (easternNow.getHours() < CUTOFF_HOUR) return false;
  return easternNow.getMinutes() >= CUTOFF_MINUTE;
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

  const dailyStatus = persistentStore.getDailyStatus();
  const formedTeams = persistentStore.getFormedTeams();

  if (dailyStatus === 'formed' && formedTeams) {
    return {
      phase: 'formed',
      minPlayers: MIN_PLAYERS,
      cutoffTimeLabel: `7:30 PM EDT`,
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
      cutoffTimeLabel: `7:30 PM EDT`,
      canGenerateNow: ENABLE_MANUAL_GENERATE,
      message: `Not enough players to form teams. Need at least ${MIN_PLAYERS}.`
    };
  }

  return {
    phase: 'collecting',
    minPlayers: MIN_PLAYERS,
    cutoffTimeLabel: `7:30 PM EDT`,
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

// 🕢 Team generation at 7:30 PM EDT (configurable)
cron.schedule(TEAM_GENERATION_CRON, async () => {
  console.log('Generating teams at cutoff...');
  const generated = generateTeamsForToday('cron');
  if (!generated.ok) {
    console.log(`❌ ${generated.error} (current: ${generated.count})`);
    return;
  }
  console.log('✅ Teams formed and finalized for today.');
}, { timezone: TIMEZONE });

app.listen(PORT, () => {
  console.log(`🚀 Unified Soccer Bot running on port ${PORT}`);
  console.log(`⚽ Team generation cron: ${TEAM_GENERATION_CRON} (${TIMEZONE})`);
  console.log(`🧪 Manual generate enabled: ${ENABLE_MANUAL_GENERATE}`);
});
