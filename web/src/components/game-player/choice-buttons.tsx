"use client";

import type { OutputChoice } from "@/lib/choicescript/engine";

interface ChoiceButtonsProps {
  choices: OutputChoice[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function ChoiceButtons({ choices, onSelect, disabled }: ChoiceButtonsProps) {
  return (
    <div className="space-y-3 py-4">
      {choices.map((choice, i) => {
        const isEnabled = choice.enabled && !disabled;

        return (
          <button
            key={choice.index}
            onClick={() => isEnabled && onSelect(choice.index)}
            disabled={!isEnabled}
            className={`
              group w-full text-left rounded-lg border px-5 py-3 min-h-[48px]
              font-serif text-base leading-relaxed
              transition-all duration-200 ease-out
              animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both
              ${
                isEnabled
                  ? "border-border bg-card hover:bg-card/80 hover:border-gold/50 hover:shadow-md hover:shadow-gold/5 cursor-pointer active:scale-[0.99]"
                  : "border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60"
              }
            `}
            style={{ animationDelay: `${i * 80 + 200}ms` }}
          >
            <div className="flex items-start gap-3">
              <span
                className={`
                  inline-block w-0.5 self-stretch rounded-full shrink-0 transition-colors duration-200
                  ${isEnabled ? "bg-border group-hover:bg-gold" : "bg-border/50"}
                `}
              />
              <span className="flex-1">
                {choice.text}
                {!choice.enabled && choice.disabledReason && (
                  <span className="block text-xs text-muted-foreground mt-1 font-sans">
                    {choice.disabledReason}
                  </span>
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
