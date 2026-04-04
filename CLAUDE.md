# The Silk Throne — Project Conventions

## Tech Stack
- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- Razorpay (payments)
- Vercel (hosting)
- Custom ChoiceScript interpreter (NOT the official compiler)

## Project Structure
```
web/                    # Next.js app
  src/
    app/                # App Router pages
    components/         # React components
      ui/               # shadcn/ui components
      layout/           # Navbar, Footer, ThemeProvider
      game-player/      # Game player UI components
      auth/             # Auth modal
    lib/
      supabase/         # Supabase client/server/middleware
      choicescript/      # Parser + Engine (core interpreter)
    context/            # React contexts (auth)
    types/              # TypeScript types
  supabase/
    migrations/         # SQL migration files
game-content/           # Game content (Part B)
  bible/                # World, characters, variables, plot, scenes, style
  scenes/               # Final ChoiceScript .txt files
  drafts/               # Writer drafts
  final/                # Approved final scenes
```

## Conventions
- TypeScript strict — no `any`
- Paid scene .txt files NEVER in public directory or frontend bundle
- RLS on every Supabase table
- Razorpay signature verification on every payment
- Mobile-first design (test at 375px)
- Secrets only in env vars, never committed
- Loading states and error boundaries everywhere
- Dark mode default

## Design System
- Dark: #0f0f1a bg, #1a1a2e surface, #e2b04a gold accent, #e8e6e1 text
- Light: #faf8f5 bg, #ffffff surface, #b8860b dark gold
- Game text: Merriweather serif 18px, line-height 1.75, max-width 680px
- UI: Inter sans-serif. Headings: Playfair Display serif

## Security Model
The custom interpreter loads scenes ONE AT A TIME from the server.
The server checks "has this user paid?" before serving each paid scene.
Paid content never reaches the browser without payment verification.

## Commands
- `cd web && npm run dev` — start dev server
- `cd web && npm run build` — production build
- `cd web && npm run lint` — ESLint check
