import { NextResponse } from "next/server";
import { createServiceRoleClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type { Game } from "@/types/database";
import { readFile } from "fs/promises";
import { join } from "path";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Demo scenes live in game-content/scenes/demo/ at the repo root
const DEMO_SCENES_DIR = join(process.cwd(), "..", "game-content", "scenes", "demo");


async function serveDemoScene(sceneName: string): Promise<NextResponse> {
  try {
    const filePath = join(DEMO_SCENES_DIR, `${sceneName}.txt`);
    const text = await readFile(filePath, "utf-8");
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string; sceneName: string } }
) {
  const { slug, sceneName } = params;

  // ------------------------------------------------------------------
  // LOCAL DEMO MODE: serve scenes from filesystem, no paywall
  // ------------------------------------------------------------------
  if (!isSupabaseConfigured()) {
    // In demo mode, all scenes are free — just serve them from disk
    return serveDemoScene(sceneName);
  }

  // ------------------------------------------------------------------
  // PRODUCTION MODE: serve from Supabase Storage with paywall
  // ------------------------------------------------------------------
  try {
    const serviceClient = await createServiceRoleClient();

    // 1. Look up the game by slug
    const { data: gameData, error: gameError } = await serviceClient
      .from("games")
      .select("*")
      .eq("slug", slug)
      .single();

    if (gameError || !gameData) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameData as unknown as Game;

    // 2. Check whether this scene is in the free list
    const isFreeScene = game.free_scene_list.includes(sceneName);

    if (!isFreeScene) {
      // 3. Authenticate the user
      const authClient = await createServerSupabaseClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!user) {
        return NextResponse.json(
          {
            error: "paywall",
            gameId: game.id,
            price_inr: game.price_inr,
            price_usd: game.price_usd,
          },
          { status: 403 }
        );
      }

      // 4. Check purchase status
      const { data: purchase } = await serviceClient
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .eq("status", "captured")
        .limit(1)
        .maybeSingle();

      if (!purchase) {
        return NextResponse.json(
          {
            error: "paywall",
            gameId: game.id,
            price_inr: game.price_inr,
            price_usd: game.price_usd,
          },
          { status: 403 }
        );
      }
    }

    // 5. Download the scene file from Supabase Storage
    const filePath = `${game.slug}/${sceneName}.txt`;
    const { data: fileData, error: storageError } = await serviceClient.storage
      .from("game-scenes")
      .download(filePath);

    if (storageError || !fileData) {
      console.error("[scene] Storage download error:", storageError?.message);
      return NextResponse.json({ error: "Scene file not found" }, { status: 404 });
    }

    const text = await fileData.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[scene] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
