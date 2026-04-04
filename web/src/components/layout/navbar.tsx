"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-gold">
            The Silk Throne
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/play"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Play
          </Link>
          {user && (
            <Link
              href="/account"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Account
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <Link href="/play">
              <Button
                size="sm"
                className="bg-gold text-background hover:bg-gold/90 font-semibold"
              >
                Play Now
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<button className="rounded-md p-2 text-foreground" aria-label="Menu" />}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <div className="mt-8 flex flex-col gap-4">
                <Link href="/" onClick={() => setMobileOpen(false)} className="text-lg font-medium">
                  Home
                </Link>
                <Link href="/play" onClick={() => setMobileOpen(false)} className="text-lg font-medium">
                  Play
                </Link>
                {user && (
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="text-lg font-medium">
                    Account
                  </Link>
                )}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                {user ? (
                  <Button variant="outline" onClick={() => { signOut(); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/play" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gold text-background hover:bg-gold/90 font-semibold">
                      Play Now
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
