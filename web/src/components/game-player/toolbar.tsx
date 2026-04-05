"use client";

import { Button } from "@/components/ui/button";
import {
  MinusIcon,
  PlusIcon,
  SaveIcon,
  FolderOpenIcon,
  BarChart3Icon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";

interface ToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSave: () => void;
  onLoad: () => void;
  onStats: () => void;
}

const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 24;

export function Toolbar({
  fontSize,
  onFontSizeChange,
  onSave,
  onLoad,
  onStats,
}: ToolbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[700px] mx-auto flex items-center justify-between px-4 py-2">
        {/* Font size controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFontSizeChange(Math.max(MIN_FONT_SIZE, fontSize - 1))}
            disabled={fontSize <= MIN_FONT_SIZE}
            className="size-10 md:size-8"
            aria-label="Decrease font size"
          >
            <MinusIcon className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-center font-sans">
            {fontSize}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFontSizeChange(Math.min(MAX_FONT_SIZE, fontSize + 1))}
            disabled={fontSize >= MAX_FONT_SIZE}
            className="size-10 md:size-8"
            aria-label="Increase font size"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onStats}
            className="size-10 md:size-8"
            aria-label="Character stats"
          >
            <BarChart3Icon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="size-10 md:size-8"
            aria-label="Save game"
          >
            <SaveIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLoad}
            className="size-10 md:size-8"
            aria-label="Load game"
          >
            <FolderOpenIcon className="size-4" />
          </Button>

          <div className="w-px h-5 bg-border/50 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-10 md:size-8"
            aria-label="Toggle play theme"
          >
            {theme === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
