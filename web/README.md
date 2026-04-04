# The Silk Throne — Web Platform

Interactive fiction game platform built with Next.js 14, featuring a custom ChoiceScript interpreter with server-side paywall protection.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Razorpay (INR) with webhook verification
- **Hosting**: Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase and Razorpay keys

# Run development server
npm run dev
```

## Setup Guide

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy Project URL and API keys to `.env.local`
3. Run the SQL migration in `supabase/migrations/001_create_tables.sql` via the SQL Editor
4. Create a Storage bucket named `game-scenes` (public: off)

### 2. Razorpay

1. Create an account at [razorpay.com](https://razorpay.com)
2. Generate API keys from Settings → API Keys
3. Set up webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
4. Webhook events: `payment.captured`

### 3. Seed Demo Content

```bash
npx tsx scripts/seed-demo.ts
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

## Architecture

### Custom ChoiceScript Interpreter

Unlike the official ChoiceScript compiler (which bundles all scenes into one HTML file), our interpreter loads scenes **one at a time** from the server. The server verifies purchase status before serving each paid scene. This means paid content never reaches the browser without payment.

```
Browser → API Request → Server checks purchase → Serves scene text → Parser → Engine → UI
```

### Key Directories

```
src/
  lib/choicescript/    # Parser + Engine (the interpreter)
  components/
    game-player/       # Game UI components
    auth/              # Auth modal
    layout/            # Navbar, Footer, Theme
  app/
    api/               # Scene serving, payments, webhooks
    play/              # Game player page
    account/           # User account page
```

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx tsx scripts/seed-demo.ts` — Seed demo game content
