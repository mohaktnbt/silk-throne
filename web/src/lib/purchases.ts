import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Check whether a user has a captured purchase for a given game.
 * Uses the service role client so it bypasses RLS.
 */
export async function hasUserPurchased(
  userId: string,
  gameId: string
): Promise<boolean> {
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .eq("status", "captured")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[hasUserPurchased] Supabase error:", error.message);
    return false;
  }

  return data !== null;
}
