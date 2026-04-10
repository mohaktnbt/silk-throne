"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import type { Game } from "@/types/database";
import { LockKeyholeIcon, BellIcon } from "lucide-react";
import Link from "next/link";

const isPaymentConfigured = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

interface PaywallScreenProps {
  game: Game;
  onPurchaseComplete: () => void;
}

function formatPrice(priceInr: number, priceUsd: number): { primary: string; secondary: string } {
  const inr = priceInr / 100;
  const usd = priceUsd / 100;
  return {
    primary: `\u20B9${inr.toFixed(0)}`,
    secondary: `$${usd.toFixed(2)}`,
  };
}

export function PaywallScreen({ game, onPurchaseComplete }: PaywallScreenProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [notified, setNotified] = useState(false);

  const price = formatPrice(game.price_inr, game.price_usd);

  const handlePurchase = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setPurchasing(true);
    setError(null);
    try {
      // 1. Create a Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({ error: "Failed to create order" }));
        setError((data as { error?: string }).error ?? "Payment failed. Please try again.");
        setPurchasing(false);
        return;
      }

      const order = (await orderRes.json()) as { id: string; amount: number; currency: string };
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        setError("Payment is not configured yet. Please try again later.");
        setPurchasing(false);
        return;
      }

      // 2. Open Razorpay checkout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay as
        | (new (opts: Record<string, unknown>) => { open: () => void })
        | undefined;

      if (!RazorpayConstructor) {
        setError("Payment gateway failed to load. Please refresh and try again.");
        setPurchasing(false);
        return;
      }

      const rzp = new RazorpayConstructor({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "The Silk Throne",
        description: `Unlock ${game.title}`,
        order_id: order.id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // 3. Verify payment server-side
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              gameId: game.id,
            }),
          });

          if (verifyRes.ok) {
            onPurchaseComplete();
          } else {
            setError("Payment verification failed. Contact support if you were charged.");
          }
          setPurchasing(false);
        },
        modal: {
          ondismiss: () => {
            setPurchasing(false);
          },
        },
        theme: { color: "#e2b04a" },
      });

      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setPurchasing(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center animate-in fade-in-0 duration-500">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 ring-1 ring-gold/20">
            <LockKeyholeIcon className="w-7 h-7 text-gold" />
          </div>

          {/* Game title */}
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
            {game.title}
          </h2>

          {/* Heading */}
          <p className="font-display text-lg text-gold mb-4">
            End of Free Preview!
          </p>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
            You&apos;ve reached the end of the free chapters. Unlock the full game
            to continue your story and discover every path.
          </p>

          {isPaymentConfigured ? (
            <>
              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-display font-bold text-foreground">
                  {price.primary}
                </span>
                <span className="text-muted-foreground text-sm ml-2">
                  ({price.secondary} USD)
                </span>
              </div>

              {/* Purchase button */}
              <Button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full max-w-xs h-12 text-base font-semibold bg-gold text-background hover:bg-gold/90 transition-all duration-200 shadow-lg shadow-gold/20"
              >
                {purchasing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Processing...
                  </span>
                ) : "Unlock Full Game"}
              </Button>

              {/* Error message */}
              {error && (
                <p className="mt-3 text-sm text-destructive max-w-xs text-center">{error}</p>
              )}
            </>
          ) : (
            <>
              {/* Coming Soon placeholder */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm font-serif italic">
                &ldquo;The conspiracy runs deeper than anyone imagined...&rdquo;
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                The full game with 50 unique endings and over 3 million words is coming soon.
              </p>

              {notified ? (
                <div className="flex items-center gap-2 text-gold text-sm font-sans">
                  <BellIcon className="w-4 h-4" />
                  <span>We&apos;ll notify you when the full game launches!</span>
                </div>
              ) : (
                <Button
                  onClick={() => { if (!user) setAuthOpen(true); else setNotified(true); }}
                  className="w-full max-w-xs h-12 text-base font-semibold bg-gold text-background hover:bg-gold/90 shadow-lg shadow-gold/20"
                >
                  <BellIcon className="w-4 h-4 mr-2" />
                  {user ? "Notify Me When Available" : "Sign Up to Get Notified"}
                </Button>
              )}

              <Button
                render={<Link href="/" />}
                variant="outline"
                className="mt-4 border-gold/30 hover:bg-gold/10"
              >
                Return to Home
              </Button>
            </>
          )}

          {/* Sign in prompt */}
          {!user && (
            <button
              onClick={() => setAuthOpen(true)}
              className="mt-4 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              Already purchased?{" "}
              <span className="underline underline-offset-2">Sign in</span>
            </button>
          )}

          {/* Features hint */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <span className="text-gold text-sm font-semibold">
                {game.word_count ? `${Math.round(game.word_count / 1000)}K` : "100K+"}
              </span>
              <span>Words</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gold text-sm font-semibold">
                {game.scene_list.length}
              </span>
              <span>Chapters</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gold text-sm font-semibold">Unlimited</span>
              <span>Replays</span>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab="signin" />
    </>
  );
}
