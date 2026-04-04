# OWNER STATUS — The Silk Throne

*Last updated: Part A COMPLETE, Part B Writer's Room ACTIVE*

---

## WHAT JUST HAPPENED

### Part A: Website — COMPLETE
All 7 phases are built and the code compiles cleanly:

1. **Project Foundation** — Next.js 14 app with TypeScript, Tailwind CSS, shadcn/ui, dark theme with gold accents
2. **Database & Auth** — Supabase tables (games, purchases, save_data) with Row Level Security, auth system (signup/login/logout)
3. **ChoiceScript Game Player** — Custom interpreter (parser + engine) that loads scenes one at a time from the server. This is the security model: paid content never reaches the browser without payment verification.
4. **Landing Page + Static Pages** — Homepage with hero section, about, how it works. Play page, account page, terms, privacy.
5. **Razorpay Payments** — Create order, verify signature, webhook for payment.captured event
6. **Demo Game Content** — 5-scene demo (~7K words) to test the full flow: free preview → paywall → paid content
7. **Deploy & Polish** — SEO (sitemap, robots.txt, OG tags), error handling, 404 page, README

### Part B: Game Bible — COMPLETE
6 comprehensive reference documents created in `game-content/bible/`:
- `world.md` — The Khazaran Empire worldbuilding (geography, history, culture, religion)
- `characters.md` — All named characters with full profiles and voice descriptions
- `variables.md` — Every game variable with starting values and modification guidelines
- `plot.md` — Complete plot outline for all 31 scenes across 3 acts + epilogue
- `scenes.md` — Scene-by-scene technical specifications with word targets totaling ~302,000 words
- `style-guide.md` — Prose style, choice design, and ChoiceScript technical rules

### Part B: Writer's Room — IN PROGRESS
10 AI writer agents are running IN PARALLEL, each writing 2-4 scenes simultaneously:
- 3 agents on Act 1 (scenes 1-8, FREE content, ~76K words)
- 4 agents on Act 2 (scenes 9-20, PAID content, ~126K words)
- 3 agents on Act 3 + Epilogue (scenes 21-31, PAID content, ~100K words)

Scene files are being written to `game-content/final/`.

---

## WHAT I NEED TO DO NOW

### Step 1: Create Supabase Account
1. Go to https://supabase.com → "Start your project" → Sign up with GitHub
2. Click "New Project" → Name: `silk-throne` → Choose Mumbai region → Create
3. Wait ~2 min for project to provision
4. Go to **Settings** → **API** (left sidebar)
5. Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Copy **service_role** key → this is `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Run Database Migration
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy-paste the entire contents of `web/supabase/migrations/001_create_tables.sql`
4. Click "Run" — you should see "Success" for each statement
5. Go to **Storage** (left sidebar) → "New bucket" → Name: `game-scenes` → Private (NOT public) → Create

### Step 3: Create Razorpay Account
1. Go to https://razorpay.com → Sign Up
2. You'll start in **Test Mode** (safe — no real money)
3. Go to **Settings** → **API Keys** → "Generate Key"
4. Copy **Key ID** → this is both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
5. Copy **Key Secret** → this is `RAZORPAY_KEY_SECRET`
6. Razorpay charges ~2% per transaction. Test card: `4111 1111 1111 1111`

### Step 4: Set Up Environment Variables
1. In terminal: `cd web`
2. Run: `cp .env.local.example .env.local`
3. Open `.env.local` in any text editor
4. Paste in all the keys from Steps 1 and 3

### Step 5: Seed Demo Content
1. Run: `cd web && npx tsx scripts/seed-demo.ts`
2. This uploads the 5 demo scenes to Supabase and creates the game record

### Step 6: Create Vercel Account (for later)
1. Go to https://vercel.com → Sign up with GitHub
2. We'll deploy after the full game is assembled

---

## HOW TO TEST IT

```bash
cd web
npm run dev
```

Open http://localhost:3000

**What you should see:**
- Dark themed homepage with gold "The Silk Throne" title
- Hero section: "A 300,000-word epic of power, betrayal, and empire"
- "Play Free Preview" button → takes you to /play
- Navigation bar with Home, Play, theme toggle
- Footer with legal links

**After Supabase is configured + demo seeded:**
- /play → Game player loads startup scene
- You can create a character, make choices, read story
- After chapter 2 → paywall appears
- Sign up → payment → unlocks remaining content
- /account → shows your email, purchases, saves

---

## WHAT'S COMING NEXT

1. **Writer agents finish** — All 31 scene files written to `game-content/final/`
2. **Continuity review** — Verify all variables, labels, and scene transitions are consistent
3. **Upload full game** — Replace demo content with the full 300K-word game
4. **Final testing** — Play through the game, fix any issues
5. **Deploy to Vercel** — Put it live on the internet
6. **Set up Razorpay webhook** — Configure webhook URL for live payments

---

## PROJECT STRUCTURE

```
silk-throne/
├── CLAUDE.md                    # Project conventions
├── OWNER-STATUS.md              # This file — your lifeline
├── README.md                    # Original repo readme
│
├── web/                         # The website (Next.js app)
│   ├── .env.local.example       # Template for API keys
│   ├── src/
│   │   ├── app/                 # Pages (home, play, account, terms, privacy)
│   │   │   ├── api/             # Backend APIs (scene serving, payments, webhooks)
│   │   │   └── auth/            # Auth callback
│   │   ├── components/
│   │   │   ├── game-player/     # The game interface (text, choices, stats, paywall)
│   │   │   ├── auth/            # Login/signup modal
│   │   │   ├── layout/          # Navbar, footer, theme
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── choicescript/    # The interpreter (parser.ts + engine.ts)
│   │   │   └── supabase/       # Database client
│   │   ├── context/             # Auth context
│   │   └── types/               # TypeScript types
│   ├── scripts/                 # Seed scripts
│   └── supabase/migrations/     # SQL for creating tables
│
├── game-content/
│   ├── bible/                   # Game design documents (6 files)
│   ├── scenes/demo/             # 5-scene demo for testing
│   ├── final/                   # Full game scenes (being written now)
│   ├── drafts/                  # Writer drafts
│   └── reviews/                 # Review notes
│
├── choicescript-reference.md    # ChoiceScript syntax reference
├── game-design-patterns.md      # Game design patterns
└── SKILL.md                     # Game builder skill definition
```

---

## PROBLEMS & SOLUTIONS

**No problems currently.**

If the dev server doesn't start:
- Run `npm install` in the `web/` folder first
- Make sure `.env.local` exists (copy from `.env.local.example`)
- The app works WITHOUT Supabase keys — it just shows placeholder content

If the seed script fails:
- Make sure Supabase keys are in `.env.local`
- Make sure you created the `game-scenes` storage bucket in Supabase dashboard
- Make sure you ran the SQL migration first

---

## GLOSSARY (Quick Reference)

| Term | What It Means |
|------|--------------|
| **Supabase** | Free cloud database + auth. Stores player accounts, purchases, saves. |
| **Razorpay** | Indian payment processor. Takes 2% fee. Supports UPI, cards, net banking. |
| **Vercel** | Free website hosting. Deploys from GitHub automatically. |
| **ChoiceScript** | The scripting language the game is written in. Plain text files with commands like *choice. |
| **Interpreter** | Our custom code that reads ChoiceScript and shows it as a beautiful web page. |
| **Paywall** | The point where free content ends. Players must pay to continue. |
| **RLS** | Row Level Security. Database rules so players only see their own data. |
| **Webhook** | When Razorpay charges someone, it notifies our server to unlock the game. |
