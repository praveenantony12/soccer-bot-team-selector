import cors from 'cors';
import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Import backend functionality
import cron from 'node-cron';
import twilio from 'twilio';
import { formatInsufficientPlayers, formatReminder, formatTeams } from './src/formatter';
import { persistentStore } from './src/persistentStore';
import { getAllPlayerNames, getPlayerByName } from './src/players';
import { balanceTeams } from './src/teamBalancer';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const app = express();
app.use(express.json());

// ✅ Enable CORS
app.use(cors({
  origin: ["https://soccer-bot-unified.onrender.com", "http://localhost:4200"],
  methods: ["GET","POST"]
}));

// 📁 Serve frontend static files
const frontendPath = join(__dirname, '../dist/soccer-bot-team-selector');
app.use(express.static(frontendPath));

// 🔄 API Routes
app.get("/api/players", (req, res) => {
  res.json(getAllPlayerNames());
});

app.get("/api/current", (req, res) => {
  res.json(persistentStore.getPlayers());
});

app.post("/api/join", (req, res) => {
  const { name } = req.body;
  persistentStore.addPlayer(name);
  res.json({ success: true });
});

app.post("/api/leave", (req, res) => {
  const { name } = req.body;
  persistentStore.removePlayer(name);
  res.json({ success: true });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    players: persistentStore.getPlayers().length 
  });
});

// 🏠 Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const GROUP_ID = process.env.WHATSAPP_GROUP_JID!;

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// 🕘 Reminder - Every minute for testing
cron.schedule("* * * * *", async () => {
  console.log("Sending reminder...");
  try {
    await client.messages.create({
      body: formatReminder(),
      from: process.env.TWILIO_NUMBER!,
      to: GROUP_ID
    });
    console.log("✅ Reminder sent successfully");
  } catch (error) {
    console.error("❌ Failed to send reminder:", error);
  }
});

// 🕖 Team generation - Every 2 minutes for testing
cron.schedule("*/2 * * * *", async () => {
  console.log("Checking team formation...");

  const names = persistentStore.getPlayers();
  console.log(`Current players: ${names.length}`);

  // Early formation: form teams immediately if we have 32+ players
  if (names.length >= 32) {
    console.log(`🚀 Early team formation triggered with ${names.length} players`);
    await formAndSendTeams(names);
    return;
  }

  // Scheduled formation: only form teams at scheduled time if we have 12+ players
  // For now, this runs every 2 minutes for testing - in production, this would be at a specific time
  if (names.length >= 12) {
    console.log(`⏰ Scheduled team formation with ${names.length} players`);
    await formAndSendTeams(names);
    return;
  }

  // Not enough players
  console.log(`❌ Not enough players (${names.length}). Need at least 12.`);
  
  try {
    await client.messages.create({
      body: formatInsufficientPlayers(names.length),
      from: process.env.TWILIO_NUMBER!,
      to: GROUP_ID
    });
    console.log("✅ Insufficient players message sent");
  } catch (error) {
    console.error("❌ Failed to send insufficient players message:", error);
  }
});

async function formAndSendTeams(names: string[]) {
  const players = names.map(name => {
    const player = getPlayerByName(name);
    if (!player) {
      console.warn(`⚠️ Player "${name}" not found in database`);
      return { name, rating: 5.0, position: "player" };
    }
    return player;
  });

  try {
    const result = balanceTeams(players);
    const message = formatTeams(result);

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_NUMBER!,
      to: GROUP_ID
    });

    persistentStore.clearPlayers();
    console.log("✅ Teams sent + reset");
  } catch (error) {
    console.error("❌ Failed to generate or send teams:", error);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Unified Soccer Bot running on ${PORT}`);
  console.log(`📅 Frontend served from: ${frontendPath}`);
  console.log(`📅 Reminder scheduled: Every minute (testing)`);
  console.log(`⚽ Team generation: Every 2 minutes (testing)`);
});
