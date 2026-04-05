"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

interface SaveToastProps {
  status: "idle" | "saved" | "error";
  onDismiss: () => void;
}

export function SaveToast({ status, onDismiss }: SaveToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      setVisible(false);
      return;
    }

    // Trigger enter animation
    const showTimer = requestAnimationFrame(() => setVisible(true));

    // Start exit animation before dismiss
    const hideTimer = setTimeout(() => setVisible(false), 2600);
    const dismissTimer = setTimeout(onDismiss, 3000);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(dismissTimer);
    };
  }, [status, onDismiss]);

  if (status === "idle") return null;

  const isSaved = status === "saved";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border px-4 py-3 shadow-lg font-sans text-sm transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      } ${
        isSaved
          ? "border-green-500/30 bg-green-950/90 text-green-200"
          : "border-destructive/30 bg-red-950/90 text-red-200"
      }`}
    >
      {isSaved ? (
        <CheckCircle2Icon className="size-4 shrink-0 text-green-400" />
      ) : (
        <XCircleIcon className="size-4 shrink-0 text-red-400" />
      )}
      <span>{isSaved ? "Game saved!" : "Save failed — please try again"}</span>
    </div>
  );
}
