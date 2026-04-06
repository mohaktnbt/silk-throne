"use client";

import React from "react";

interface TextDisplayProps {
  text: string;
  fontSize: number;
}

/** Parse BBCode [i]...[/i] and [b]...[/b] into React elements */
function renderBBCode(input: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const regex = /\[([bi])\](.*?)\[\/\1\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      result.push(input.slice(lastIndex, match.index));
    }
    const tag = match[1].toLowerCase();
    const content = match[2];
    if (tag === "i") {
      result.push(<em key={match.index}>{content}</em>);
    } else {
      result.push(<strong key={match.index}>{content}</strong>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    result.push(input.slice(lastIndex));
  }
  return result;
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
                {renderBBCode(part)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
