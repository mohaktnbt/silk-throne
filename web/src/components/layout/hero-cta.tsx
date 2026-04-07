"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "silk-throne-save-the-silk-throne-auto";

export function HeroCTA() {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.state?.currentScene) {
          setHasSave(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      {hasSave ? (
        <>
          <Button
            render={<Link href="/play" />}
            size="lg"
            className="bg-gold text-background hover:bg-gold/90 px-8 py-6 text-lg font-semibold"
          >
            Continue Playing
          </Button>
          <Button
            render={<a href="#about" />}
            variant="outline"
            size="lg"
            className="border-gold/30 px-8 py-6 text-lg hover:bg-gold/10"
          >
            Learn More
          </Button>
        </>
      ) : (
        <>
          <Button
            render={<Link href="/play" />}
            size="lg"
            className="bg-gold text-background hover:bg-gold/90 px-8 py-6 text-lg font-semibold"
          >
            Play Free Preview
          </Button>
          <Button
            render={<a href="#about" />}
            variant="outline"
            size="lg"
            className="border-gold/30 px-8 py-6 text-lg hover:bg-gold/10"
          >
            Learn More
          </Button>
        </>
      )}
    </div>
  );
}
