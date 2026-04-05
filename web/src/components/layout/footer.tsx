"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/play") {
    return (
      <footer className="relative z-10 border-t border-border/50 bg-background py-3 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} The Silk Throne. All rights reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <span className="font-display text-lg font-bold text-gold">
              The Silk Throne
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              A 300,000-word epic of power, betrayal, and empire.
              Your choices shape the fate of the Khazaran Empire.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Navigate
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/play" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-gold transition-colors">
                  Play
                </Link>
              </li>
              <li>
                <Link href="/account" prefetch={false} className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-gold transition-colors">
                  Account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/terms" prefetch={false} className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" prefetch={false} className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} The Silk Throne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
