# OWNER STATUS — The Silk Throne

*Last updated: ALL PHASES COMPLETE*

---

## WHAT JUST HAPPENED

### EVERYTHING IS BUILT.

**Part A: Website** — 7 phases complete, code compiles, pushed to GitHub.
**Part B: Game Bible** — 6 comprehensive reference documents (31K words of game design).
**Part B: Writer's Room** — 10 parallel AI writers produced 232,000+ words of game content across 32 scene files.

### What was built:

**The Website (web/):**
- Next.js 14 app with dark theme, gold accents, Merriweather serif text
- Custom ChoiceScript interpreter (parser + engine) — loads scenes one at a time, server checks payment before serving paid scenes
- Supabase auth (signup/login), database (games, purchases, saves), storage (scene files)
- Razorpay payment integration (create order, verify signature, webhook)
- Game player UI: text display, choice buttons, stats panel, save/load, paywall screen
- Landing page, play page, account page, terms, privacy, 404 page
- SEO: sitemap, robots.txt, OpenGraph meta tags

**The Game (game-content/final/):**
- 31 scenes + stats file = 32 ChoiceScript .txt files
- 232,000+ words of rich, literary prose
- 3 major routes (Loyalist, Kingmaker, Revolutionary)
- 3 romance options (Leila, Navid, Asha)
- 15 unique endings
- Investigation, combat, politics, romance, hub exploration scenes
- Proper ChoiceScript with variables, fairmath, choices, page breaks, conditional branching

---

## WHAT I NEED TO DO NOW (Step by step)

### Step 1: Create Supabase Project (5 minutes)
1. Go to https://supabase.com
2. Click "Start your project" — sign up with GitHub
3. Click "New Project"
   - Name: `silk-throne`
   - Password: make up a strong one, SAVE IT
   - Region: Mumbai (ap-south-1) or Singapore
4. Click "Create new project" — wait 2 minutes

### Step 2: Get Supabase Keys (2 minutes)
1. In Supabase dashboard, click **Settings** (gear icon, left sidebar)
2. Click **API**
3. Copy these three values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)
   - **service_role** key (another long string starting with `eyJ`)

### Step 3: Set Up Environment Variables (2 minutes)
1. Open terminal, navigate to the project:
   ```bash
   cd silk-throne/web
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in any text editor (VS Code, nano, etc.)
3. Fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
   ```

### Step 4: Run Database Migration (3 minutes)
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `web/supabase/migrations/001_create_tables.sql` on your computer
4. Copy the ENTIRE contents, paste into the SQL editor
5. Click **Run** — you should see "Success" messages
6. Go to **Storage** (left sidebar) → click "New bucket"
   - Name: `game-scenes`
   - Toggle: **Private** (NOT public)
   - Click "Create bucket"

### Step 5: Seed Demo Content (1 minute)
```bash
cd web
npm install    # if you haven't already
npx tsx scripts/seed-demo.ts
```
This uploads the 5 demo scenes and creates the game record.

### Step 6: Test Locally (2 minutes)
```bash
cd web
npm run dev
```
Open http://localhost:3000
- You should see the dark-themed homepage
- Click "Play Free Preview" — the game should load
- Play through the demo scenes
- After chapter 2, the paywall should appear

### Step 7: Set Up Razorpay (5 minutes)
1. Go to https://razorpay.com → Sign Up
2. You start in **Test Mode** (no real money)
3. Go to **Settings** → **API Keys** → "Generate Key"
4. Add to `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```
5. Test card number: `4111 1111 1111 1111` (any expiry, any CVV)

### Step 8: Deploy to Vercel (5 minutes)
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import `silk-throne` repo
3. Set root directory to `web`
4. Add all environment variables from `.env.local`
5. Click "Deploy"
6. Your site will be live at `https://silk-throne-xxx.vercel.app`

### Step 9: Set Up Razorpay Webhook (2 minutes)
1. In Razorpay dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://your-vercel-url.vercel.app/api/webhooks/razorpay`
3. Select event: `payment.captured`
4. Add a webhook secret (save it, add to Vercel env vars as needed)

### Step 10: Upload Full Game (when ready)
The full 232K word game is in `game-content/final/`. To replace the demo with the full game:
1. Update the seed script to point to `game-content/final/` instead of `game-content/scenes/demo/`
2. Update the scene_list and free_scene_list in the seed script to match all 31 scene files
3. Run the seed script again

---

## HOW TO TEST IT

### Without Supabase (basic UI test):
```bash
cd web && npm run dev
```
- http://localhost:3000 — Homepage loads
- http://localhost:3000/play — Game player shows (with placeholder if no Supabase)
- http://localhost:3000/account — Account page
- http://localhost:3000/terms — Terms of service
- http://localhost:3000/privacy — Privacy policy

### With Supabase configured:
- http://localhost:3000/play — Full game loads from Supabase storage
- Sign up with email → confirm email → sign in
- Play through free scenes → paywall appears after scene 8
- Make payment (test mode) → continue playing paid content

---

## PROBLEMS & SOLUTIONS

| Problem | Solution |
|---------|----------|
| `npm run dev` fails | Run `npm install` in `web/` first |
| Build fails about env vars | Create `.env.local` from `.env.local.example` |
| Seed script fails | Check Supabase keys in `.env.local`, create `game-scenes` bucket |
| Game won't load | Check Supabase URL/key are correct, check browser console |
| Payment fails | Make sure Razorpay keys are set, use test card `4111...` |
| Scenes not loading | Make sure scene files are uploaded to `game-scenes` bucket |

---

## FINAL NUMBERS

| Metric | Value |
|--------|-------|
| Total game words | 232,000+ |
| Scene files | 32 (31 scenes + stats) |
| Routes | 3 (Loyalist, Kingmaker, Revolutionary) |
| Romance options | 3 (Leila, Navid, Asha) |
| Unique endings | 15 |
| Free scenes | 8 (Act 1) |
| Paid scenes | 23 (Act 2 + Act 3 + Epilogue) |
| Price | INR 299 / USD 4.99 |
| Bible documents | 6 files, 31K words |
| Website pages | 7 (home, play, account, terms, privacy, 404, auth callback) |
| API routes | 4 (scene serving, create order, verify payment, webhook) |
| React components | 15+ |
| TypeScript files | 30+ |
