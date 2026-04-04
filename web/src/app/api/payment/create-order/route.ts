import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Game } from "@/types/database";

interface CreateOrderBody {
  gameId?: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export async function POST(request: Request) {
  // ---- env check -----------------------------------------------------------
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 503 }
    );
  }

  // ---- authenticate user ---------------------------------------------------
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- parse body ----------------------------------------------------------
  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { gameId } = body;
  if (!gameId) {
    return NextResponse.json(
      { error: "gameId is required" },
      { status: 400 }
    );
  }

  // ---- look up game --------------------------------------------------------
  const serviceClient = await createServiceRoleClient();
  const { data: gameData, error: gameError } = await serviceClient
    .from("games")
    .select("id, price_inr, title")
    .eq("id", gameId)
    .single();

  if (gameError || !gameData) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const game = gameData as unknown as Pick<Game, "id" | "price_inr" | "title">;

  // ---- create Razorpay order -----------------------------------------------
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require("razorpay") as {
      new (opts: { key_id: string; key_secret: string }): {
        orders: {
          create: (opts: {
            amount: number;
            currency: string;
            receipt: string;
          }) => Promise<RazorpayOrder>;
        };
      };
    };

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await instance.orders.create({
      amount: game.price_inr, // amount in paise
      currency: "INR",
      receipt: `game_${gameId}_${user.id}`,
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[create-order] Razorpay error:", err);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
