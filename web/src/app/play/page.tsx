import type { Metadata } from "next";
import type { Game } from "@/types/database";
import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Play The Silk Throne, a 300,000-word interactive fiction epic. Shape the fate of the Khazaran Empire.",
};

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Demo game object used when Supabase is not configured
const DEMO_GAME: Game = {
  id: "demo",
  slug: "the-silk-throne",
  title: "The Silk Throne",
  tagline: "A 300,000-word epic of power, betrayal, and empire",
  description: "You are the Grand Vizier of the Khazaran Empire...",
  long_description: null,
  cover_image_url: null,
  price_inr: 29900,
  price_usd: 499,
  genre: "Historical Fantasy",
  word_count: 300000,
  scene_list: [
    "startup", "scene2", "scene3", "scene4", "scene5",
    "scene6", "scene7", "scene8", "scene9", "scene10",
    "scene11", "scene12", "scene13", "scene14", "scene15",
    "scene16", "scene17", "scene18", "scene19", "scene20",
    "scene21", "scene22", "scene23", "scene24", "scene25",
    "scene26", "scene27", "scene28", "scene29", "scene30",
    "epilogue", "choicescript_stats",
  ],
  free_scene_list: [
    "startup", "scene2", "scene3", "scene4",
    "scene5", "scene6", "scene7", "scene8",
    "choicescript_stats",
  ],
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function fetchGame(): Promise<Game> {
  if (!isSupabaseConfigured()) {
    return DEMO_GAME;
  }

  try {
    const { createServiceRoleClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("slug", "the-silk-throne")
      .single();

    if (error) {
      console.error("[play] Failed to fetch game:", error.message);
      return DEMO_GAME;
    }

    return data as unknown as Game;
  } catch (err) {
    console.error("[play] Unexpected error fetching game:", err);
    return DEMO_GAME;
  }
}

export default async function PlayPage() {
  const game = await fetchGame();

  return (
    <div className="flex flex-1 flex-col">
      <PlayClient game={game} />
    </div>
  );
}
