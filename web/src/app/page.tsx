import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroCTA } from "@/components/layout/hero-cta";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-gold">
            Interactive Fiction
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight text-foreground sm:text-6xl md:text-7xl">
            The Silk{" "}
            <span className="text-gold">Throne</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            A 300,000-word epic of power, betrayal, and empire. Your choices
            shape the fate of the Khazaran Empire.
          </p>
          <HeroCTA />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-foreground sm:text-4xl">
            About the <span className="text-gold">Game</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Set in the Khazaran Empire — inspired by Mughal India, the Ottoman
            Empire, and the Silk Road — you play as the newly appointed Grand
            Vizier navigating deadly court politics.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-gold">300,000</h3>
              <p className="mt-1 text-sm text-muted-foreground">Words of Epic Story</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-gold">20+</h3>
              <p className="mt-1 text-sm text-muted-foreground">Hours of Gameplay</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-gold">15</h3>
              <p className="mt-1 text-sm text-muted-foreground">Unique Endings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-foreground sm:text-4xl">
            Key <span className="text-gold">Features</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            More than a novel, more than a game — an experience shaped by your decisions.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Branching Narrative",
                desc: "Every choice opens new paths. Alliances, betrayals, and romances weave through hundreds of branching storylines with 15 distinct endings.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: "Character Stats",
                desc: "Track your influence, cunning, military prowess, and court favour. Your stats unlock unique dialogue options and story paths.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
              },
              {
                title: "Cloud Save System",
                desc: "Your progress syncs across devices. Pick up exactly where you left off — on desktop, tablet, or phone.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                ),
              },
              {
                title: "Free Preview",
                desc: "Play the first eight chapters completely free. No account required to start — just dive in and explore.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Dark & Light Themes",
                desc: "Read in the mode that suits you. A carefully crafted dark fantasy aesthetic with full light mode support.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ),
              },
              {
                title: "Mobile-First Design",
                desc: "Optimised for reading on any screen. The serif typography and generous spacing make long sessions comfortable.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border/50 bg-card p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Lore Teaser */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-gold">
                The World
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                The Khazaran <span className="text-gold">Empire</span>
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A realm where silk-draped corridors hide poisoned daggers, and every
                  whispered word in the imperial court can topple a dynasty. The Khazaran
                  Empire stretches from sun-scorched deserts to snow-capped mountain
                  passes, bound together by trade, tradition, and fear.
                </p>
                <p>
                  As the newly appointed Grand Vizier, you inherit a court fractured by
                  rival factions: the military commanders who secured the throne, the
                  merchant guilds who finance the empire, and the religious scholars who
                  grant it legitimacy. None of them trust you. All of them need you.
                </p>
                <p>
                  Inspired by the grandeur of Mughal India, the intrigue of the Ottoman
                  court, and the vast networks of the Silk Road.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-8">
              <h3 className="font-display text-lg font-semibold text-gold">
                What Awaits You
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Navigate deadly court politics with rival viziers and scheming nobles",
                  "Build alliances through diplomacy, marriage, or military force",
                  "Manage the empire's economy, military, and religious institutions",
                  "Uncover conspiracies that threaten to tear the empire apart",
                  "Shape the fate of millions through your moral choices",
                  "Romance complex characters with their own agendas",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-foreground sm:text-4xl">
            How It <span className="text-gold">Works</span>
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Browse", desc: "Discover the world of the Khazaran Empire" },
              { step: "2", title: "Play Free", desc: "Experience the first eight chapters completely free" },
              { step: "3", title: "Unlock", desc: "Purchase to continue your epic journey" },
              { step: "4", title: "Continue", desc: "Your saves sync across devices — never lose progress" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-background font-bold">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Shape an <span className="text-gold">Empire</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Begin your journey as the Grand Vizier. Every choice matters. Every
            alliance has a price. Every betrayal has consequences.
          </p>
          <Button
            render={<Link href="/play" />}
            size="lg"
            className="mt-8 bg-gold text-background hover:bg-gold/90 px-8 py-6 text-lg font-semibold"
          >
            Start Playing Now
          </Button>
        </div>
      </section>
    </div>
  );
}
