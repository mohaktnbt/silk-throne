"use client";

import { Button } from "@/components/ui/button";

export default function PlayError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-bold text-gold">
        The story has hit a snag
      </h1>
      <p className="mt-4 text-muted-foreground">
        Something went wrong loading the game. Please try again.
      </p>
      <Button
        onClick={reset}
        className="mt-8 bg-gold text-background hover:bg-gold/90"
      >
        Try Again
      </Button>
    </div>
  );
}
