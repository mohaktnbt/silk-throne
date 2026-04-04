/**
 * Client-side Razorpay checkout utility.
 *
 * Loads the Razorpay checkout.js script dynamically, creates an order via our
 * API, opens the payment popup, and verifies the result server-side.
 */

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayCheckoutInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayCheckoutInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

// -------------------------------------------------------------------------
// Script loader
// -------------------------------------------------------------------------

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------

export interface InitiatePaymentOptions {
  gameId: string;
  gameName: string;
  amount: number;
  currency: string;
  userEmail: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (error: unknown) => void;
}

export async function initiatePayment(
  options: InitiatePaymentOptions
): Promise<void> {
  const {
    gameId,
    gameName,
    userEmail,
    onSuccess,
    onFailure,
  } = options;

  try {
    // 1. Create order on our server
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Order creation failed (${res.status})`);
    }

    const order: { id: string; amount: number; currency: string } =
      await res.json();

    // 2. Load checkout script
    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not available on window");
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      throw new Error("Razorpay key not configured");
    }

    // 3. Open payment popup
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: gameName,
      description: `Unlock full game: ${gameName}`,
      order_id: order.id,
      prefill: { email: userEmail },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          // 4. Verify payment server-side
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              gameId,
            }),
          });

          if (!verifyRes.ok) {
            const body: { error?: string } = await verifyRes
              .json()
              .catch(() => ({}));
            throw new Error(
              body.error ?? `Verification failed (${verifyRes.status})`
            );
          }

          onSuccess(response);
        } catch (err) {
          onFailure(err);
        }
      },
      modal: {
        ondismiss: () => {
          onFailure(new Error("Payment cancelled by user"));
        },
      },
    });

    rzp.open();
  } catch (err) {
    onFailure(err);
  }
}
