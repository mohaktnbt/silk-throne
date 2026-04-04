import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
            The Silk{" "}
            <span className="text-gold">Throne</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            A 300,000-word epic of power, betrayal, and empire. Your choices
            shape the fate of the Khazaran Empire.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/play">
              <Button
                size="lg"
                className="bg-gold text-background hover:bg-gold/90 px-8 py-6 text-lg font-semibold"
              >
                Play Free Preview
              </Button>
            </Link>
            <a href="#about">
              <Button
                variant="outline"
                size="lg"
                className="border-gold/30 px-8 py-6 text-lg hover:bg-gold/10"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center sm:text-4xl">
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

      {/* How It Works */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center sm:text-4xl">
            How It <span className="text-gold">Works</span>
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Browse", desc: "Discover the world of the Khazaran Empire" },
              { step: "2", title: "Play Free", desc: "Experience the first 3 chapters completely free" },
              { step: "3", title: "Unlock", desc: "Purchase to continue your epic journey" },
              { step: "4", title: "Continue", desc: "Your saves sync across devices — never lose progress" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-background font-bold">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to Shape an <span className="text-gold">Empire</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Begin your journey as the Grand Vizier. Every choice matters. Every
            alliance has a price. Every betrayal has consequences.
          </p>
          <Link href="/play" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-gold text-background hover:bg-gold/90 px-8 py-6 text-lg font-semibold"
            >
              Start Playing Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
