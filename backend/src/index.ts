import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import cron from "node-cron";
import twilio from "twilio";

import { formatInsufficientPlayers, formatReminder, formatTeams } from "./formatter";
import { getAllPlayerNames, getPlayerByName } from "./players";
import { addPlayer, clearPlayers, getPlayers, removePlayer } from "./store";
import { balanceTeams } from "./teamBalancer";

const app = express();
app.use(bodyParser.json());

// ✅ Enable CORS
app.use(cors({
  origin: ["http://localhost:4200", "http://127.0.0.1:55437"], // allow Angular dev server and browser preview
  methods: ["GET","POST"]
}));

// serve static files (frontend build later)
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const GROUP_ID = process.env.GROUP_ID!;

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH!
);

// APIs
app.get("/players", (req, res) => {
  res.json(getAllPlayerNames());
});

app.get("/current", (req, res) => {
  res.json(getPlayers());
});

app.post("/join", (req, res) => {
  const { name } = req.body;
  addPlayer(name);
  res.json({ success: true });
});

app.post("/leave", (req, res) => {
  const { name } = req.body;
  removePlayer(name);
  res.json({ success: true });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    players: getPlayers().length 
  });
});

// 🕘 Reminder - Every Tuesday, Thursday, and Sunday at 9 AM
cron.schedule("0 9 * * 2,4,0", async () => {
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

// 🕖 Team generation - Every Tuesday, Thursday, and Sunday at 7 PM
cron.schedule("0 19 * * 2,4,0", async () => {
  console.log("Generating teams...");

  const names = getPlayers();
  console.log(`Current players: ${names.length}`);

  // ✅ NEW LOGIC - Check if we have enough players
  if (names.length < 12) {
    console.log(`❌ Not enough players (${names.length}). Skipping team generation.`);
    
    // Send insufficient players message
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
    
    return; // ❌ No team generation
  }

  // Get full player data with ratings
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

    clearPlayers();
    console.log("✅ Teams sent + reset");
  } catch (error) {
    console.error("❌ Failed to generate or send teams:", error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Soccer Bot Server running on ${PORT}`);
  console.log(`📅 Reminder scheduled: 9 AM (Tue, Thu, Sun)`);
  console.log(`⚽ Team generation: 7 PM (Tue, Thu, Sun)`);
});
