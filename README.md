# Agent Anywhere

One dashboard to manage social media across Facebook, Instagram, X, Reddit and LinkedIn — AI captions and post ideas, campaigns, and scheduling.

Live: https://agent-anywhere.vercel.app

## What it does

- Connect your social accounts (Facebook, Instagram, X, Reddit, LinkedIn) and manage them from one place
- Generate captions and post ideas with AI (Groq)
- Organise posts into campaigns and schedule them
- Sign up with email or Google

## Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: FastAPI (Python), PostgreSQL
- AI: Groq (OpenAI-compatible API)

## Run it locally

```bash
git clone https://github.com/SubhamThakur80661/agent-anywhere.git
cd agent-anywhere
```

Backend:

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Frontend:

```bash
npm install
npm run dev
```

The backend needs `DATABASE_URL` (Postgres) and `GROQ_API_KEY` set in `server/.env` — copy `.env.example` there and fill in your keys. Without a Groq key, captions and ideas fall back to demo text.

## Connecting platforms

Each platform needs its own OAuth app before it can connect — the setup guides in this repo walk through it (see `FACEBOOK_APP_SETUP.md`, `TWITTER_SETUP_INSTRUCTIONS.md`, `REDDIT_SETUP_INSTRUCTIONS.md`, `LINKEDIN_SETUP_INSTRUCTIONS.md`). Instagram connects with manual credentials by design.

## Deployment

The live app runs on Vercel (frontend) and Render (backend, free tier — the first request after idle can take a minute to wake up), with Postgres on Neon.
