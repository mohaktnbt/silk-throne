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

  // ---- verify HMAC signature (timing-safe) ---------------------------------
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (
    expectedSignature.length !== razorpay_signature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    )
  ) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // ---- verify payment server-side with Razorpay ----------------------------
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }

  let paymentAmount: number;
  let paymentStatus: string;
  let orderNotes: Record<string, string> | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require("razorpay") as {
      new (opts: { key_id: string; key_secret: string }): {
        payments: { fetch: (id: string) => Promise<{ amount: number; status: string; order_id: string }> };
        orders: { fetch: (id: string) => Promise<{ notes: Record<string, string> }> };
      };
    };
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Fetch payment to confirm status and amount
    const payment = await instance.payments.fetch(razorpay_payment_id);
    paymentAmount = payment.amount;
    paymentStatus = payment.status;

    // Fetch order to verify gameId matches
    const order = await instance.orders.fetch(razorpay_order_id);
    orderNotes = order.notes;
  } catch (err) {
    console.error("[verify] Razorpay fetch error:", err);
    return NextResponse.json({ error: "Failed to verify payment with gateway" }, { status: 502 });
  }

  // Confirm payment is actually captured
  if (paymentStatus !== "captured") {
    return NextResponse.json({ error: `Payment not captured (status: ${paymentStatus})` }, { status: 400 });
  }

  // Verify the order was created for this game
  if (orderNotes?.game_id && orderNotes.game_id !== gameId) {
    return NextResponse.json({ error: "Game ID mismatch" }, { status: 400 });
  }

  // ---- look up game to verify amount --------------------------------------
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

  // Verify amount paid matches the game price
  if (paymentAmount < game.price_inr) {
    console.error(`[verify] Amount mismatch: paid ${paymentAmount}, expected ${game.price_inr}`);
    return NextResponse.json({ error: "Payment amount does not match game price" }, { status: 400 });
  }

  // ---- upsert purchase record ----------------------------------------------
  const purchaseRecord = {
    user_id: user.id,
    game_id: gameId,
    razorpay_order_id,
    razorpay_payment_id,
    amount_paise: paymentAmount,
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
