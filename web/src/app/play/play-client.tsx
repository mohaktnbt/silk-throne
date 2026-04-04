"use client";

import type { Game } from "@/types/database";
import { GamePlayer } from "@/components/game-player/game-player";

interface PlayClientProps {
  game: Game;
}

export function PlayClient({ game }: PlayClientProps) {
  return (
    <div className="flex flex-1 flex-col">
      <GamePlayer gameSlug={game.slug} game={game} />
    </div>
  );
}
