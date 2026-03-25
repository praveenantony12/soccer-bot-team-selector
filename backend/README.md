# Soccer Bot Backend

This backend handles the soccer team management system with automated WhatsApp notifications and team balancing.

## Features

- 🤖 **Automated WhatsApp Reminders** (Tue, Thu, Sun at 9 AM)
- ⚽ **Team Generation & Balancing** (Tue, Thu, Sun at 7 PM)
- 📊 **Skill-based Team Balancing** using player ratings
- 🏃‍♂️ **Player Management** with ratings and positions
- 📱 **REST API** for frontend integration
- ✅ **Health Checks** and monitoring

## Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Required Environment Variables**
   ```
   WHATSAPP_GROUP_JID=your-group-jid@g.us
   TWILIO_SID=your-twilio-sid
   TWILIO_AUTH=your-twilio-auth-token
   TWILIO_NUMBER=your-twilio-phone-number
   BASE_URL=https://your-app-name.onrender.com
   PORT=3000
   ```

## Development

### Simple Server (for development)
```bash
npm run dev:simple
```
Runs a basic Express server with mock data for frontend development.

### Full Server (with WhatsApp)
```bash
npm run dev
```
Runs the full TypeScript server with Twilio integration and cron jobs.

### Production
```bash
npm run build
npm start
```

## API Endpoints

- `GET /players` - Get all available players
- `GET /current` - Get current game participants
- `POST /join` - Add player to current game
- `GET /health` - Health check endpoint

## Team Balancing Algorithm

The system uses a greedy algorithm to balance teams:
1. Sort players by rating (highest first)
2. Assign each player to the team with lower total rating
3. Ensure position diversity when possible

## WhatsApp Schedule

- **Reminders**: 9 AM on Tuesday, Thursday, Sunday
- **Team Generation**: 7 PM on Tuesday, Thursday, Sunday
- **Minimum Players**: 12 required for team generation

## Player Database

Players are defined in `src/players.ts` with:
- Name
- Rating (1-10 scale)
- Skill level (beginner/intermediate/advanced)
- Preferred position

## Deployment

1. Set environment variables in your hosting platform
2. Build the application: `npm run build`
3. Start the server: `npm start`

The server will automatically:
- Send WhatsApp reminders at scheduled times
- Generate balanced teams when enough players join
- Reset player list after team generation
