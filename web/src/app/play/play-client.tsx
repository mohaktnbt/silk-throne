"use client";

import type { Game } from "@/types/database";
import { GamePlayer } from "@/components/game-player/game-player";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PlayClientProps {
  game: Game | null;
}

/**
 * Client wrapper for the Play page.
 *
 * Renders the GamePlayer when game data is available, or shows a
 * placeholder when Supabase is not configured / game not found.
 */
export function PlayClient({ game }: PlayClientProps) {
  if (!game) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold">
            <span className="text-gold">The Silk Throne</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            The game is temporarily unavailable. Please try again in a few moments.
          </p>
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="mt-8 border-gold/30 hover:bg-gold/10"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <GamePlayer gameSlug={game.slug} game={game} />
    </div>
  );
}
