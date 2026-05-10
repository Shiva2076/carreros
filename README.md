# CareerOS

A full-stack SaaS personal command center for job hunting and freelance work — with AI cover letters (Groq), Kanban job tracking, a freelance CRM, and n8n workflow automations.

## Features

- **Job tracker** — Kanban board (Applied → Interview → Offer → Rejected) with drag-and-drop
- **AI cover letters** — Groq `llama-3.3-70b-versatile` generates personalized letters in seconds
- **Skill matching** — Auto-scores each job 0-100 based on JD vs. your background
- **Freelance CRM** — Client table, invoice tracking, status badges
- **n8n automations** — Invoice reminders, weekly digest, job intake enrichment
- **Google Calendar** — Auto-creates interview events when a job moves to Interview
- **Weekly digest** — Groq-powered Monday morning career summary

---

## Quick start

```bash
git clone <repo-url>
cd careeros
npm install

# Copy and fill in your API keys
cp .env.example .env.local
# edit .env.local with your keys

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in with Google.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in each value:

### NEXTAUTH_SECRET
Generate with: `openssl rand -base64 32`

### Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Enable APIs: **Gmail API** and **Google Calendar API**
6. To get `GOOGLE_REFRESH_TOKEN`: use [OAuth Playground](https://developers.google.com/oauthplayground):
   - Authorize scopes: `gmail.send` + `calendar`
   - Exchange for tokens → copy the refresh token

### MONGODB_URI
1. [MongoDB Atlas](https://cloud.mongodb.com/) → Create free cluster
2. **Database Access** → Add user with read/write
3. **Network Access** → Allow `0.0.0.0/0` (or your IP)
4. **Connect** → Drivers → copy the connection string

### GROQ_API_KEY
1. [GroqCloud](https://console.groq.com/) → Create API key (free tier is generous)

### REDIS_URL
**Local:** `redis://localhost:6379` (install Redis with `brew install redis` or Docker)

**Railway:**
1. [Railway](https://railway.app/) → New project → Add Redis
2. Copy the `REDIS_URL` from the Variables tab

### N8N_BASE_URL + N8N_WEBHOOK_SECRET
**Local:** `http://localhost:5678` and any secret string

**Railway:**
1. Railway → New project → Deploy from template → n8n
2. Use the public URL as `N8N_BASE_URL`

---

## Running workers (BullMQ)

In a second terminal, run the background workers:

```bash
npm run worker
```

Workers handle:
- `score-job` — calls Groq to score job-resume match
- `create-calendar-event` — creates Google Calendar events for interviews
- `send-email` — sends emails via Gmail OAuth

> On Vercel (serverless), workers must run separately — use Railway, Fly.io, or a VPS.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all `.env.local` variables to Vercel project settings under **Environment Variables**.

Update Google OAuth redirect URI to: `https://your-app.vercel.app/api/auth/callback/google`

---

## Deploy n8n to Railway

1. Railway → **New project** → **Deploy from template** → search "n8n"
2. Set environment variables in Railway (see `N8N_WORKFLOWS.md`)
3. Set `CAREEROS_URL` in n8n to your Vercel URL
4. Import and configure the 4 workflows described in `N8N_WORKFLOWS.md`

---

## n8n workflow setup

See [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md) for detailed setup of all 4 automations:
1. Job intake enrichment
2. AI cover letter email
3. Automated invoice reminders
4. Weekly career digest

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Shadcn UI |
| Auth | NextAuth.js v5 (Google OAuth) |
| Database | MongoDB Atlas (Mongoose) |
| Queue | Redis + BullMQ |
| AI | Groq API (llama-3.3-70b-versatile) |
| Automation | n8n webhooks |
| Email | Gmail API + Nodemailer OAuth2 |
| Calendar | Google Calendar API |
| Deploy | Vercel (app) + Railway (Redis + n8n) |
