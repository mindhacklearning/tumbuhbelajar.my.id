# TumbuhBelajar.my.id - Game Edukasi Matematika SMP

Platform SaaS untuk guru Matematika SMP dengan game edukasi "Detektif Data" berbasis AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite (included)

### Installation

```bash
# Clone repository
git clone https://github.com/mindhacklearning/tumbuhbelajar.my.id.git
cd tumbuhbelajar.my.id

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run database migration
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Deploy

```bash
# Build
npm run build

# The app is ready for Vercel/GitHub Pages
```

## 📁 Project Structure

```
tumbuhbelajar.my.id/
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── page.tsx      # Landing page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   │   ├── prisma.ts     # Prisma client
│   │   └── ai.ts         # AI service (Sumopod)
│   └── styles/           # CSS
├── .env                  # Environment variables
└── package.json
```

## 🔑 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Sumopod
SUMOPOD_API_KEY="your-sumopod-api-key"
SUMOPOD_BASE_URL="https://api.sumopod.my.id/v1"

# Payment (Midtrans)
MIDTRANS_SERVER_KEY="your-midtrans-key"
```

## 💰 Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| Free | Rp 0 | 1 demo game, basic analytics |
| Starter | Rp 25.000/mo | Unlimited games, 50 AI actions, 1-3 kelas |
| Pro | Rp 50.000/mo | + AI unlimited, documents, 4-7 kelas |
| Premium | Rp 100.000/mo | + deep analytics, all features, unlimited kelas |

## 🤖 AI Integration

Primary AI: **MiniMax-M2.7-highspeed** via Sumopod
- Input: $0.03/1M tokens (90% discount!)
- Output: $0.12/1M tokens
- Cost per question generation: ~Rp 6

Fallback models:
- kimi-k2.7 (mid-tier analysis)
- kimi-k3 (deep reasoning)

## 📊 Database Schema

- **User** - Authentication (Google OAuth)
- **Teacher** - Subscription, AI usage tracking
- **Student** - Class enrollment, progress
- **ClassRoom** - Teacher's classes
- **Game** - TKA game definitions
- **Mission** - Game missions (1 game = 6 missions)
- **Question** - TKA questions
- **Attempt** - Student game attempts
- **AIAnalysis** - AI usage logging
- **Document** - Generated RPP/LKPD

## 🔐 Authentication

Google OAuth for:
- Teacher login
- Student login (via class code)

## 📱 Features

- [x] Landing page with pricing
- [x] Database schema (Prisma + SQLite)
- [x] AI question generation (Sumopod)
- [ ] Teacher dashboard
- [ ] Student game interface
- [ ] Google OAuth login
- [ ] Document generation (RPP, LKPD)
- [ ] Analytics & N-Gain calculation
- [ ] Payment integration (Midtrans)
- [ ] Affiliate system

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Google OAuth)
- **AI**: Sumopod API (MiniMax, Kimi)
- **Domain**: tumbuhbelajar.my.id (managed via Sumopod)
- **Deployment**: Vercel / GitHub Pages

## 📄 License

MIT License

---

Built with ❤️ for Indonesian teachers and students
