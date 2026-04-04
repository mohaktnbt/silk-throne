import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Game } from "@/types/database";

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  gameId?: string;
}

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 503 }
    );
  }

  // ---- authenticate --------------------------------------------------------
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- parse body ----------------------------------------------------------
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    gameId,
  } = body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !gameId
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // ---- verify HMAC signature -----------------------------------------------
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // ---- look up game to get amount ------------------------------------------
  const serviceClient = await createServiceRoleClient();
  const { data: gameData } = await serviceClient
    .from("games")
    .select("id, price_inr")
    .eq("id", gameId)
    .single();

  if (!gameData) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const game = gameData as unknown as Pick<Game, "id" | "price_inr">;

  // ---- upsert purchase record ----------------------------------------------
  const purchaseRecord = {
    user_id: user.id,
    game_id: gameId,
    razorpay_order_id,
    razorpay_payment_id,
    amount_paise: game.price_inr,
    currency: "INR",
    status: "captured",
  };

  const { error: upsertError } = await serviceClient
    .from("purchases")
    .upsert(purchaseRecord as never, { onConflict: "user_id,game_id" });

  if (upsertError) {
    console.error("[verify] Upsert error:", upsertError.message);
    return NextResponse.json(
      { error: "Failed to record purchase" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
