# 🏰 Sobranie Clan Tracker

Modern clan management system for tracking Alco/Petra contributions with beautiful UI and role-based access control.

## ✨ Features

- **🎮 Discord Authentication** - Seamless login with Discord OAuth
- **👥 Role Management** - Лідер, Заступник, Старший, Слуги with granular permissions
- **📊 Statistics Dashboard** - Real-time tracking of contributions and payments
- **📝 Request System** - Screenshot-based verification workflow
- **💰 Payment Tracking** - Automated calculation and payout management
- **📱 Responsive Design** - Works perfectly on mobile and desktop
- **🎨 Premium UI** - Animated, glass-morphism design with wow-factor

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Discord credentials

# Run development server
npm run dev
```

### Production Deployment

Choose your preferred method:

#### 🐳 Docker (Self-hosted)
```bash
# Build and run
docker build -t clan-tracker .
docker run -p 3000:3000 clan-tracker
```

#### ☁️ Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy with one click

#### 🚄 Railway
1. Connect GitHub repo
2. Configure environment variables
3. Deploy automatically

## 🔧 Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
OWNER_DISCORD_ID="your-discord-user-id"
```

## 📁 Project Structure

```
clan-tracker/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin panels
│   ├── api/            # API routes
│   └── [...]/          # Pages
├── components/         # React components
│   ├── admin/         # Admin components
│   └── ui/            # Reusable UI components
├── prisma/            # Database schema
├── src/server/        # Server-side logic
└── public/            # Static assets
```

## 👥 Roles & Permissions

| Role | Ukrainian | Permissions |
|------|-----------|-------------|
| LEADER | Лідер | Full access |
| DEPUTY | Заступник | Admin panels |
| SENIOR | Старший | Admin panels |
| ALCO_STAFF | Сл. Алко | Alco requests |
| PETRA_STAFF | Сл. Петра | Petra requests |
| MEMBER | Учасник | Basic access |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Auth**: NextAuth.js + Discord OAuth
- **Deployment**: Docker, Vercel, Railway

## 🔒 Security

- Discord OAuth2 authentication
- Role-based access control
- Input validation and sanitization
- Secure session management
- Rate limiting protection

## 📱 Screenshots

*[Add screenshots here]*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with ❤️ for Sobranie clan
- Designed for elite gaming communities
- Inspired by modern web aesthetics

---
*Made with passion by Саня Космос*