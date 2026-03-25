# 🚀 Deployment Guide for Render

## 📋 Prerequisites

- Render account (Free tier available)
- Twilio account with WhatsApp enabled
- WhatsApp Group JID
- Git repository with your code

## 🎯 Clean URL Deployment

**Single service serving both frontend and backend together**
**URL: https://soccer-bot.render.com**

---

## 🔧 Step 1: Update Environment Variables

```bash
WHATSAPP_GROUP_JID=your-group-jid@g.us
TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=TWILIO_AUTH_TOKEN
TWILIO_NUMBER=TWILIO_NUMBER
BASE_URL=https://soccer-bot.render.com
PORT=3000
NODE_ENV=production
TZ=America/New_York
LOG_LEVEL=info
```

## 🚀 Step 2: Deploy Clean Service

### 1. Build and Deploy
```bash
# Build TypeScript source files
npm run build

# Deploy to Render
git add backend/unified-render.yaml
git commit -m "Deploy soccer bot with clean URL"
git push
```

### 2. Render Configuration
The `unified-render.yaml` contains:
- **Service Name**: soccer-bot
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `backend`
- **All environment variables** configured

### 3. How Service Works
- **Single Node.js server** serves both API and static files
- **Frontend** served from `/dist/soccer-bot-team-selector`
- **Backend API** served from `/api/*` endpoints
- **Clean URL**: `https://soccer-bot.render.com`
- **Shared persistence** across both frontend and backend

---

## 🎯 Step 3: Configure Frontend

Frontend is already configured to use:
```typescript
private readonly BASE_URL = 'https://soccer-bot.render.com';
```

---

## 🧪 Step 4: Testing

### 1. Test Flow
```bash
# 1. Visit your app
https://soccer-bot.render.com

# 2. Add players via UI
# 3. Wait 1-2 minutes for team generation
# 4. Check WhatsApp group for automated messages
# 5. Verify persistence across cold starts
```

### 2. Monitor Service
```bash
# Check health endpoint
curl https://soccer-bot.render.com/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2026-03-25T13:30:00.000Z",
  "players": 5
}
```

### 3. Test API Endpoints
```bash
# Get current players
curl https://soccer-bot.render.com/api/current

# Test join
curl -X POST https://soccer-bot.render.com/api/join \
  -H "Content-Type: application/json" \
  -d '{"name": "john"}'

# Test leave
curl -X POST https://soccer-bot.render.com/api/leave \
  -H "Content-Type: application/json" \
  -d '{"name": "john"}'
```

---

## 🔄 Cold Start & Persistence

### ✅ Clean Solution Benefits

- **Single persistence layer** - no data loss on cold starts
- **One deployment** - simpler management and debugging
- **Shared storage** - frontend and backend use same data
- **Automatic reset** - daily at midnight for fresh games
- **Cold start proof** - loads from file on restart
- **Clean URL** - professional appearance

### Persistence Flow
```typescript
// Service handles persistence automatically
1. Any player action → Save to players.json
2. Cold start → Load from players.json
3. New day → Auto-reset at midnight
4. Teams formed → Clear data for next game
```

---

## 🚨 Testing Schedule

Currently configured for testing:
- **Reminders**: Every minute (`* * * * *`)
- **Team Generation**: Every 2 minutes (`*/2 * * * *`)

### 🏆 Production Schedule
When ready for production, update cron schedules in `unified-server-cjs.js`:
```javascript
// Production schedules
cron.schedule("0 9 * * 2,4,0", async () => { ... }); // Tue/Thu/Sun 9 AM
cron.schedule("0 19 * * 2,4,0", async () => { ... }); // Tue/Thu/Sun 7 PM
```

---

## 🚨 Common Issues & Solutions

### Issue: Frontend Not Loading
**Solution**: Check static file path in `unified-server-cjs.js`

### Issue: API Not Accessible  
**Solution**: Verify `/api/*` routes are working

### Issue: WhatsApp Not Working
**Solution**: Verify Twilio credentials and group JID format

### Issue: Persistence Failing
**Solution**: Check file permissions in Render environment

---

## 📈 Scaling Recommendations

### For Production Use:
1. **Upgrade to Render Starter** ($7/month)
2. **Keep unified service** (simpler and cheaper)
3. **Add monitoring** with Render's built-in metrics
4. **Custom domain** (already have clean URL!)

### Storage Options:
- **Current**: File-based persistence (works on free tier)
- **Upgrade**: Render PostgreSQL add-on for better reliability
- **Alternative**: Redis add-on for improved performance

---

## 🎯 Quick Test Checklist

- [ ] Service deployed and healthy
- [ ] Frontend accessible at https://soccer-bot.render.com
- [ ] API endpoints working (`/api/*`)
- [ ] WhatsApp messages sending correctly
- [ ] Players persisting after cold starts
- [ ] Team generation working with 12+ players
- [ ] Daily reset happening automatically
- [ ] Logs showing persistence events

---

## 🏆 Deployment Complete

**Your soccer bot is ready with a clean URL!** 

**Benefits:**
- ✅ **Clean URL** - https://soccer-bot.render.com
- ✅ **Single deployment** - one URL to manage
- ✅ **Shared persistence** - no data sync issues
- ✅ **Cold start proof** - survives restarts
- ✅ **Production ready** - easy to scale
- ✅ **Professional appearance** - clean branding

---

## 🚀 Quick Start Commands

```bash
# Deploy service with clean URL
npm run build
git add backend/unified-render.yaml
git commit -m "Deploy soccer bot with clean URL"
git push

# Monitor deployment
curl https://soccer-bot.render.com/api/health
```

**Deploy with the clean URL for the best experience!** 🎉

## 🆘 Support

If you encounter issues:
1. Check Render logs first
2. Verify environment variables
3. Test API endpoints manually
4. Monitor WhatsApp message delivery
5. Check persistence file creation

---
**Happy testing!** 🎉 Your soccer bot should now work reliably on Render with automatic persistence across cold starts!
