"use client";

import { useEffect, useRef } from "react";

interface TextDisplayProps {
  text: string;
  fontSize: number;
}

export function TextDisplay({ text, fontSize }: TextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const paragraphs = containerRef.current.querySelectorAll(".game-paragraph");
      paragraphs.forEach((p, i) => {
        const el = p as HTMLElement;
        el.style.animationDelay = `${i * 60}ms`;
      });
    }
  }, [text]);

  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div
      ref={containerRef}
      className="game-text space-y-4"
      style={{ fontSize: `${fontSize}px` }}
    >
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Handle single newlines within a paragraph as <br>
        const parts = trimmed.split(/\n/);

        return (
          <p
            key={`${index}-${trimmed.slice(0, 32)}`}
            className="game-paragraph animate-in fade-in-0 duration-500 fill-mode-both text-foreground leading-[1.75]"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {parts.map((part, partIndex) => (
              <span key={partIndex}>
                {partIndex > 0 && <br />}
                {part}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
