import type { Metadata } from "next";
import type { Game } from "@/types/database";
import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Play - The Silk Throne",
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

async function fetchGame(): Promise<Game | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Dynamic import so the server module is never bundled on the client
    const { createServiceRoleClient } = await import(
      "@/lib/supabase/server"
    );
    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("slug", "the-silk-throne")
      .single();

    if (error) {
      console.error("[play] Failed to fetch game:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[play] Unexpected error fetching game:", err);
    return null;
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
