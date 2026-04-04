import { NextResponse } from "next/server";
import { createServiceRoleClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type { Game } from "@/types/database";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const DEMO_SCENE_TEXT = `*comment Demo scene — Supabase is not configured.
This is a placeholder scene for local development.

You stand at the gates of the Khazaran Empire.
The sun beats down on sandstone walls as merchants bustle past.

*choice
  #Enter the palace courtyard
    You step through the ornate archway.
    *finish
  #Explore the bazaar
    The scent of spices fills the air.
    *finish
`;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string; sceneName: string } }
) {
  const { slug, sceneName } = params;

  // ------------------------------------------------------------------
  // If Supabase isn't configured, serve a demo scene so local dev works
  // ------------------------------------------------------------------
  if (!isSupabaseConfigured()) {
    return new NextResponse(DEMO_SCENE_TEXT, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const serviceClient = await createServiceRoleClient();

    // 1. Look up the game by slug
    const { data: gameData, error: gameError } = await serviceClient
      .from("games")
      .select("*")
      .eq("slug", slug)
      .single();

    if (gameError || !gameData) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Scene file not found" },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
