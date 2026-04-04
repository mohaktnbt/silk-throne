import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types for the Razorpay webhook payload (only the fields we need)
// ---------------------------------------------------------------------------

interface RazorpayWebhookEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  notes?: Record<string, string>;
}

interface RazorpayWebhookPayment {
  entity: RazorpayWebhookEntity;
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: RazorpayWebhookPayment;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  // ---- read raw body for signature verification ----------------------------
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature header" },
      { status: 400 }
    );
  }

  // ---- verify signature ----------------------------------------------------
  let valid = false;
  try {
    valid = verifyWebhookSignature(rawBody, signature, webhookSecret);
  } catch {
    valid = false;
  }

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // ---- parse payload -------------------------------------------------------
  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ---- handle payment.captured event ---------------------------------------
  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const gameId = payment.notes?.["game_id"];
    const userId = payment.notes?.["user_id"];

    if (!gameId || !userId) {
      // If notes are missing we cannot attribute the purchase. Log and ack.
      console.warn(
        "[webhook] payment.captured missing game_id or user_id in notes:",
        { orderId, paymentId }
      );
      return NextResponse.json({ received: true });
    }

    const serviceClient = await createServiceRoleClient();

    const purchaseRecord = {
      user_id: userId,
      game_id: gameId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount_paise: payment.amount,
      currency: payment.currency,
      status: "captured",
    };

    const { error } = await serviceClient
      .from("purchases")
      .upsert(purchaseRecord as never, { onConflict: "user_id,game_id" });

    if (error) {
      console.error("[webhook] Upsert error:", error.message);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  // Acknowledge all events so Razorpay does not retry
  return NextResponse.json({ received: true });
}
