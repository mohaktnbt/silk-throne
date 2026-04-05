"use client";

import React from "react";

interface TextDisplayProps {
  text: string;
  fontSize: number;
}

export function TextDisplay({ text, fontSize }: TextDisplayProps) {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div
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
            className="game-paragraph animate-in fade-in-0 duration-500 fill-mode-forwards text-foreground leading-[1.75]"
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
