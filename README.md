# ⚽ Soccer Team Selector

A complete soccer team management system with automated WhatsApp notifications, skill-based team balancing, and a beautiful modern UI.

## 🚀 Features

### Frontend (Angular)
- 🎨 **Modern UI** with soccer-themed design
- 🔍 **Real-time search** for 50+ players
- 📱 **Responsive design** for all devices
- ⚡ **Instant loading** with smooth animations
- 🏃 **Player selection** with visual feedback
- 📊 **Live updates** of current game participants

### Backend (Node.js + Express)
- 🤖 **Automated WhatsApp Reminders** (Tue, Thu, Sun at 9 AM)
- ⚽ **Smart Team Balancing** using player ratings and skills
- 📈 **Skill-based Algorithm** for fair team distribution
- 🏆 **Position Management** (Goalkeeper, Defender, Midfielder, Forward)
- 📱 **Twilio Integration** for WhatsApp messaging
- 🔄 **Automated Scheduling** with cron jobs

## 📋 System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Frontend      │    │   Backend       │
│   Group         │◄──►│   (Angular)     │◄──►│   (Node.js)     │
│                 │    │                 │    │                 │
│ 📱 Reminders    │    │ 🎨 Player UI   │    │ 🤖 API Server   │
│ ⚽ Team Results  │    │ 🔍 Search      │    │ ⚖️ Team Balancer│
│ 📊 Game Updates  │    │ 📱 Responsive  │    │ 📅 Cron Jobs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Angular CLI
- Twilio Account (for WhatsApp)

### 1. Clone & Install
```bash
git clone <repository-url>
cd soccer-bot-team-selector

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your Twilio credentials
```

### 3. Start Development

#### Option A: Start both frontend and backend
```bash
npm run dev
```

#### Option B: Start individually
```bash
# Frontend only
npm start

# Backend (simple - for development)
npm run start:backend

# Backend (full - with WhatsApp)
npm run start:full
```

### 4. Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📱 WhatsApp Integration Setup

### 1. Twilio Configuration
1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Set up a WhatsApp-enabled phone number
4. Get your WhatsApp Group JID

### 2. Environment Variables
```bash
# In backend/.env
WHATSAPP_GROUP_JID=12345678901234567890@g.us
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH=your_auth_token
TWILIO_NUMBER=whatsapp:+14155238886
BASE_URL=https://your-app.onrender.com
```

## 🏃‍♂️ How It Works

### 1. Daily Schedule
- **9 AM (Tue, Thu, Sun)**: WhatsApp reminder with app link
- **7 PM (Tue, Thu, Sun)**: Team generation if 12+ players joined

### 2. Team Balancing Algorithm
1. Players sorted by rating (highest first)
2. Greedy assignment to team with lower total rating
3. Position diversity considered when possible
4. Balance quality indicated (🟢 Excellent, 🟡 Good, 🔴 Poor)

### 3. Player Management
- **48 Players** in database with ratings (1-10 scale)
- **4 Positions**: Goalkeeper, Defender, Midfielder, Forward

## 🎨 Frontend Features

### Player Selection
- **Compact tiles** for large player pools
- **Real-time search** functionality
- **Visual feedback** for selections
- **Player count** display
- **Smooth scrolling** grid

### UI/UX Design
- **Soccer-themed** gradients and colors
- **Responsive layout** for all devices
- **Loading animations** for better UX
- **Empty states** and error handling

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/players` | Get all available players |
| GET | `/current` | Get current game participants |
| POST | `/join` | Add player to current game |
| GET | `/health` | Server health check |

## 📦 Project Structure

```
soccer-bot-team-selector/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── components/
│   │   │   └── join/            # Main player selection component
│   │   └── ...
│   └── ...
├── backend/                      # Node.js backend
│   ├── src/
│   │   ├── index.ts            # Main server file
│   │   ├── players.ts          # Player database
│   │   ├── teamBalancer.ts     # Team balancing algorithm
│   │   ├── formatter.ts        # WhatsApp message formatting
│   │   └── store.ts            # In-memory storage
│   ├── simple-server.js        # Development server
│   ├── package.json
│   └── README.md
├── package.json                 # Root package.json
└── README.md
```

## 🚀 Deployment

### Frontend (Angular)
```bash
# Build for production
ng build

# Deploy dist/ folder to your hosting service
```

### Backend (Node.js)
```bash
# Build TypeScript
cd backend && npm run build

# Deploy to hosting service (Render, Heroku, etc.)
# Set environment variables in production
```

### Environment Variables Required
- `WHATSAPP_GROUP_JID`
- `TWILIO_SID`
- `TWILIO_AUTH`
- `TWILIO_NUMBER`
- `BASE_URL`
- `PORT`

## 🎯 Usage Examples

### Development Workflow
```bash
# Start both services
npm run dev

# Open browser to http://localhost:4200
# Search for players, select them, click "Join"
# Check WhatsApp group for automated messages
```

### Testing Team Generation
```bash
# Add 12+ players via the UI
# Wait for 7 PM or manually trigger the endpoint
# Check WhatsApp for balanced teams
```

## 🛠️ Available Scripts

### Frontend
- `npm start` - Start Angular dev server
- `ng build` - Build for production
- `ng test` - Run unit tests

### Backend
- `npm run start:backend` - Simple server (dev)
- `npm run start:full` - Full server with WhatsApp
- `npm run build:backend` - Build TypeScript

### Combined
- `npm run dev` - Start both frontend and backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

**Built with ❤️ for soccer enthusiasts!** ⚽
