# Clan Tracker - Docker Deployment Guide

## 🐳 Local Development with Docker

### Prerequisites
- Docker Desktop installed and running
- Windows, macOS, or Linux

### Quick Start

1. **Build the image:**
```bash
# Windows
scripts\build-docker.bat

# Linux/macOS  
bash scripts/build-docker.sh
```

2. **Run the container:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prod.db" \
  -e NEXTAUTH_SECRET="your-super-secret-key-here-min-32-characters" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e DISCORD_CLIENT_ID="your-discord-client-id" \
  -e DISCORD_CLIENT_SECRET="your-discord-client-secret" \
  -e OWNER_DISCORD_ID="your-discord-user-id" \
  clan-tracker
```

3. **Access the app:**
Open http://localhost:3000 in your browser

## 🚀 Production Deployment Options

### Option 1: Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy with one click

### Option 2: Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Option 3: Self-hosted with Docker
```bash
# Build for production
docker build -t clan-tracker .

# Run with persistent data
docker run -d \
  --name clan-tracker \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e DATABASE_URL="file:./prod.db" \
  -e NEXTAUTH_SECRET="your-production-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  clan-tracker
```

## 🔧 Environment Variables

Copy `.env.production.example` to `.env.production` and fill in:

```bash
# Database
DATABASE_URL="file:./prod.db"

# Auth
NEXTAUTH_SECRET="your-32-char-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
OWNER_DISCORD_ID="your-discord-user-id"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## 📁 Project Structure for Docker

```
clan-tracker/
├── Dockerfile          # Build instructions
├── docker-compose.yml  # Multi-container setup
├── .dockerignore       # Files to exclude from build
├── data/              # Persistent data volume
└── prod.db           # Production database
```

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong secrets (32+ characters)
- Enable HTTPS in production
- Regular database backups
- Rate limiting for API endpoints

## 🆘 Troubleshooting

**Container won't start:**
- Check environment variables
- Verify Docker Desktop is running
- Check port 3000 availability

**Database issues:**
- Ensure data volume has write permissions
- Check DATABASE_URL format

**OAuth not working:**
- Verify Discord redirect URIs
- Check NEXTAUTH_URL matches your domain