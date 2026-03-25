import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { join } from 'path';

// Import backend functionality
import { persistentStore } from './src/persistentStore';
import { getAllPlayerNames, getPlayerByName } from './src/players';
import { balanceTeams } from './src/teamBalancer';
import { formatInsufficientPlayers, formatReminder, formatTeams } from './src/formatter';
import cron from 'node-cron';
import twilio from 'twilio';

const app = express();
app.use(express.json());

// ✅ Enable CORS
app.use(cors({
  origin: ["https://your-frontend-name.onrender.com", "http://localhost:4200"],
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
  console.log("Generating teams...");

  const names = persistentStore.getPlayers();
  console.log(`Current players: ${names.length}`);

  if (names.length < 12) {
    console.log(`❌ Not enough players (${names.length}). Skipping team generation.`);
    
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
    
    return;
  }

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
});

app.listen(PORT, () => {
  console.log(`🚀 Unified Soccer Bot running on ${PORT}`);
  console.log(`📅 Frontend served from: ${frontendPath}`);
  console.log(`📅 Reminder scheduled: Every minute (testing)`);
  console.log(`⚽ Team generation: Every 2 minutes (testing)`);
});
