import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-gold">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        This path leads nowhere. Even the Spymaster couldn&apos;t find it.
      </p>
      <Button
        render={<Link href="/" />}
        className="mt-8 bg-gold text-background hover:bg-gold/90"
      >
        Return to the Empire
      </Button>
    </div>
  );
}
