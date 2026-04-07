"use client";

import { Button } from "@/components/ui/button";
import {
  MinusIcon,
  PlusIcon,
  SaveIcon,
  CheckIcon,
  FolderOpenIcon,
  BarChart3Icon,
  RotateCcwIcon,
  Undo2Icon,
} from "lucide-react";

interface ToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSave: () => void;
  onLoad: () => void;
  onStats: () => void;
  onRestart: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  saveStatus?: "idle" | "saved" | "error";
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

export function Toolbar({
  fontSize,
  onFontSizeChange,
  onSave,
  onLoad,
  onStats,
  onRestart,
  onUndo,
  canUndo = false,
  saveStatus = "idle",
}: ToolbarProps) {
  return (
    <div className="fixed top-16 left-0 right-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[700px] mx-auto flex items-center justify-between px-3 sm:px-4 py-2">
        {/* Font size controls */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFontSizeChange(Math.max(MIN_FONT_SIZE, fontSize - 1))}
            disabled={fontSize <= MIN_FONT_SIZE}
            className="size-10"
            aria-label="Decrease font size"
            title="Decrease font size"
          >
            <MinusIcon className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums w-7 text-center font-sans" title="Font size">
            A<span className="text-[10px]">{fontSize}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFontSizeChange(Math.min(MAX_FONT_SIZE, fontSize + 1))}
            disabled={fontSize >= MAX_FONT_SIZE}
            className="size-10"
            aria-label="Increase font size"
            title="Increase font size"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {onUndo && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="size-10"
              aria-label="Undo last choice"
              title="Undo last choice"
            >
              <Undo2Icon className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onStats}
            className="size-10"
            aria-label="Character Stats"
            title="Character Stats"
          >
            <BarChart3Icon className="size-4" />
          </Button>
          <div className="relative size-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              className={`size-8 transition-colors ${saveStatus === "saved" ? "text-green-500" : saveStatus === "error" ? "text-destructive" : ""}`}
              aria-label="Save Game"
              title="Save Game"
            >
              {saveStatus === "saved" ? (
                <CheckIcon className="size-4" />
              ) : (
                <SaveIcon className="size-4" />
              )}
            </Button>
            {saveStatus !== "idle" && (
              <span
                className={`pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-sans leading-none ${saveStatus === "saved" ? "text-green-500" : "text-destructive"}`}
              >
                {saveStatus === "saved" ? "Saved!" : "Failed"}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLoad}
            className="size-10"
            aria-label="Load Game"
            title="Load Game"
          >
            <FolderOpenIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRestart}
            className="size-10"
            aria-label="Restart"
            title="Restart"
          >
            <RotateCcwIcon className="size-4" />
          </Button>

        </div>
      </div>
    </div>
  );
}
