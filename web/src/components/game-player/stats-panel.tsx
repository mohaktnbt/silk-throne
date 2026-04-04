"use client";

import type { StatDisplay } from "@/lib/choicescript/engine";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface StatsPanelProps {
  stats: StatDisplay[];
  open: boolean;
  onClose: () => void;
}

function StatBar({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-sans text-foreground">{label}</span>
        <span className="font-sans text-muted-foreground tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function OpposedPair({
  label,
  rightLabel,
  value,
}: {
  label: string;
  rightLabel: string;
  value: number;
}) {
  const percent = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-sans text-foreground">{label}</span>
        <span className="font-sans text-foreground">{rightLabel}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{percent}%</span>
        <span>{100 - percent}%</span>
      </div>
    </div>
  );
}

function TextStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/50 last:border-0">
      <span className="font-sans text-muted-foreground">{label}</span>
      <span className="font-serif text-foreground">{value}</span>
    </div>
  );
}

export function StatsPanel({ stats, open, onClose }: StatsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-lg text-gold">
            Character Stats
          </SheetTitle>
          <SheetDescription>
            Your character&apos;s attributes and progress.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          {stats.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No stats available yet.
            </p>
          )}
          {stats.map((stat, index) => {
            switch (stat.type) {
              case "percent":
                return (
                  <StatBar
                    key={`${stat.label}-${index}`}
                    label={stat.label}
                    value={typeof stat.value === "number" ? stat.value : 0}
                  />
                );
              case "opposed_pair":
                return (
                  <OpposedPair
                    key={`${stat.label}-${index}`}
                    label={stat.label}
                    rightLabel={stat.rightLabel ?? ""}
                    value={typeof stat.value === "number" ? stat.value : 50}
                  />
                );
              case "text":
                return (
                  <TextStat
                    key={`${stat.label}-${index}`}
                    label={stat.label}
                    value={String(stat.value ?? "")}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
