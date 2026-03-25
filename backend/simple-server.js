const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

// Enable CORS for both localhost:4200 and the browser preview
app.use(cors({
  origin: ["http://localhost:4200", "http://127.0.0.1:55437"],
  methods: ["GET", "POST"]
}));

// Mock data - expanded to simulate 50-60 players
const playersDB = [
  "john", "mike", "alex", "sam", "rob", "dan", "steve", "mark",
  "james", "david", "chris", "tom", "paul", "andrew", "jason", "ryan",
  "kevin", "brian", "george", "edward", "frank", "henry", "walter", "gary",
  "ronald", "timothy", "joseph", "charles", "anthony", "matthew", "joshua", "daniel",
  "patricia", "jennifer", "linda", "elizabeth", "barbara", "susan", "jessica", "sarah",
  "karen", "nancy", "lisa", "betty", "helen", "sandra", "donna", "carol"
];
let currentPlayers = [];

// API endpoints
app.get("/players", (req, res) => {
  res.json(playersDB);
});

app.get("/current", (req, res) => {
  res.json(currentPlayers);
});

app.post("/join", (req, res) => {
  const { name } = req.body;
  if (name && !currentPlayers.includes(name)) {
    currentPlayers.push(name);
  }
  res.json({ success: true });
});

app.post("/leave", (req, res) => {
  const { name } = req.body;
  if (name) {
    currentPlayers = currentPlayers.filter(player => player !== name);
  }
  res.json({ success: true });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    players: currentPlayers.length 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Simple server running on ${PORT}`);
});
