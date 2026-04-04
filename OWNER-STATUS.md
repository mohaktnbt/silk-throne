# OWNER STATUS — The Silk Throne

*Last updated: Phase 1 in progress*

---

## WHAT JUST HAPPENED

Phase 1 (Project Foundation) is being built:
- Created a Next.js 14 website with TypeScript and Tailwind CSS
- Installed shadcn/ui (pre-built UI components that look beautiful)
- Set up the dark theme with gold accents (the signature look)
- Created the Navbar (top bar with "The Silk Throne" logo and navigation)
- Created the Footer (bottom bar with links)
- Created the home page with Hero section, About, How It Works, and CTA
- Set up Supabase auth (login/signup system)
- Created the auth modal (popup for sign-in/sign-up)
- Created CLAUDE.md with project conventions

---

## WHAT I NEED TO DO NOW

### 1. Create a Supabase Account (Free — stores your player accounts and game data)
1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
4. Name: `silk-throne`
5. Set a strong database password (SAVE THIS — you'll need it)
6. Region: Choose closest to India (Mumbai or Singapore)
7. Click "Create new project" — wait ~2 minutes
8. Go to **Settings** → **API** (left sidebar)
9. Copy **Project URL** → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
10. Copy **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
11. Copy **service_role** key → paste as `SUPABASE_SERVICE_ROLE_KEY`

### 2. Create a Razorpay Account (Payment processor — how players pay you)
1. Go to https://razorpay.com
2. Click "Sign Up" → use your business email
3. You'll start in **Test Mode** (fake payments for testing)
4. Go to **Settings** → **API Keys** → **Generate Key**
5. Copy **Key ID** → paste as both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
6. Copy **Key Secret** → paste as `RAZORPAY_KEY_SECRET`
7. Razorpay charges ~2% per transaction. Money goes to your bank account.

### 3. Create a Vercel Account (Free — puts your website on the internet)
1. Go to https://vercel.com
2. Sign up with GitHub
3. We'll deploy later in Phase 7

### 4. Set Up Environment Variables
1. In the `web/` folder, copy `.env.local.example` to `.env.local`
2. Fill in the Supabase and Razorpay keys from steps above

---

## HOW TO TEST IT

After Phase 1 is complete:
```bash
cd web
npm run dev
```
Open http://localhost:3000 — you should see:
- Dark themed homepage with gold "The Silk Throne" title
- Navigation bar at top
- Hero section with "Play Free Preview" button
- About section with word count, play time, endings
- Footer with links

---

## WHAT'S COMING NEXT

- **Phase 2**: Database setup (run SQL to create tables) + user login system
- **Phase 3**: The game player itself (the part where you actually read and make choices)
- **Phase 4**: Polish the landing page
- **Phase 5**: Payment integration (Razorpay)
- **Phase 6**: Demo game content (5 short scenes to test everything)
- **Phase 7**: Deploy to the internet

---

## PROBLEMS & SOLUTIONS

No problems yet. If the dev server doesn't start:
- Make sure you ran `npm install` in the `web/` folder
- Make sure Node.js is installed (`node --version` should show v18+)
- Check that `.env.local` exists (copy from `.env.local.example`)
