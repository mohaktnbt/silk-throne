"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "@/lib/choicescript/engine";
import type { GameOutput, GameState, StatDisplay } from "@/lib/choicescript/engine";
import { parseScene } from "@/lib/choicescript/parser";
import { useAuth } from "@/context/auth-context";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Game } from "@/types/database";

import { TextDisplay } from "./text-display";
import { ChoiceButtons } from "./choice-buttons";
import { StatsPanel } from "./stats-panel";
import { PaywallScreen } from "./paywall-screen";
import { Toolbar } from "./toolbar";
import { SaveToast } from "./save-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GamePlayerProps {
  gameSlug: string;
  game: Game;
}

interface TextBlock {
  id: string;
  text: string;
}

interface SaveSlot {
  state: GameState;
  textHistory: TextBlock[];
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAVE_KEY_PREFIX = "silk-throne-save-";
const FONT_SIZE_KEY = "silk-throne-font-size";
const AUTO_SAVE_INTERVAL = 30_000; // 30 seconds
const MANUAL_SLOT_COUNT = 3;

function autoSaveKey(gameSlug: string): string {
  return `${SAVE_KEY_PREFIX}${gameSlug}-auto`;
}

function manualSlotKey(gameSlug: string, slot: number): string {
  return `${SAVE_KEY_PREFIX}${gameSlug}-slot-${slot}`;
}

function readSlot(key: string): SaveSlot | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SaveSlot;
  } catch {
    return null;
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GamePlayer({ gameSlug, game }: GamePlayerProps) {
  const { user } = useAuth();

  // Engine ref - persists across renders without causing re-renders
  const engineRef = useRef<GameEngine | null>(null);

  // Game state
  const [output, setOutput] = useState<GameOutput | null>(null);
  const [textHistory, setTextHistory] = useState<TextBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [paywallActive, setPaywallActive] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<StatDisplay[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentScene, setCurrentScene] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveToast, setSaveToast] = useState<"idle" | "saved" | "error">("idle");
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);

  // Preferences
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window === "undefined") return 18;
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    if (stored) return Math.max(12, Math.min(24, Number(stored)));
    return window.innerWidth < 768 ? 14 : 18;
  });

  // Refs for auto-scroll
  const contentEndRef = useRef<HTMLDivElement>(null);
  const loadedScenesRef = useRef<Set<string>>(new Set());

  // -----------------------------------------------------------------------
  // Scene loading
  // -----------------------------------------------------------------------

  const fetchScene = useCallback(
    async (sceneName: string): Promise<string | null> => {
      try {
        const response = await fetch(
          `/api/games/${gameSlug}/scenes/${sceneName}`
        );

        if (response.status === 403) {
          try {
            const data: unknown = await response.json();
            if (
              typeof data === "object" &&
              data !== null &&
              "error" in data &&
              (data as Record<string, unknown>).error === "paywall"
            ) {
              setPaywallActive(true);
              return null;
            }
          } catch {
            // Not JSON — just a 403
          }
          setPaywallActive(true);
          return null;
        }

        if (!response.ok) {
          throw new Error(`Failed to load scene: ${sceneName} (${response.status})`);
        }

        // The API returns plain text (text/plain), not JSON
        const text = await response.text();
        if (!text || text.trim().length === 0) {
          throw new Error(`Empty scene response for: ${sceneName}`);
        }
        return text;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      }
    },
    [gameSlug]
  );

  const loadSceneIntoEngine = useCallback(
    async (sceneName: string): Promise<boolean> => {
      const engine = engineRef.current;
      if (!engine) return false;

      // Skip if already loaded
      if (loadedScenesRef.current.has(sceneName)) return true;

      const sceneText = await fetchScene(sceneName);
      if (!sceneText) return false;

      const ast = parseScene(sceneText);
      engine.loadScene(sceneName, ast);
      loadedScenesRef.current.add(sceneName);
      return true;
    },
    [fetchScene]
  );

  // -----------------------------------------------------------------------
  // Process engine output
  // -----------------------------------------------------------------------

  const processOutput = useCallback((engineOutput: GameOutput) => {
    // Accumulate text into history
    if (engineOutput.text) {
      setTextHistory((prev) => [
        ...prev,
        { id: generateBlockId(), text: engineOutput.text as string },
      ]);
    }

    setOutput(engineOutput);

    // Update current scene indicator
    const engine = engineRef.current;
    if (engine) {
      setCurrentScene(engine.getState().currentScene);
    }

    // Scroll to top of new content after a brief delay for render
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

  // -----------------------------------------------------------------------
  // Handle scene changes (goto_scene)
  // -----------------------------------------------------------------------

  const handleSceneChange = useCallback(
    async (sceneName: string) => {
      setLoading(true);
      const loaded = await loadSceneIntoEngine(sceneName);
      if (!loaded) {
        setLoading(false);
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;

      const result = engine.startGame(sceneName);
      setLoading(false);

      if (result.type === "scene_change" && result.nextScene) {
        await handleSceneChange(result.nextScene);
      } else {
        processOutput(result);
      }
    },
    [loadSceneIntoEngine, processOutput]
  );

  // -----------------------------------------------------------------------
  // Continue execution (after choice, page_break, etc.)
  // -----------------------------------------------------------------------

  const continueExecution = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    const result = engine.continueExecution();

    if (result.type === "scene_change" && result.nextScene) {
      await handleSceneChange(result.nextScene);
    } else {
      processOutput(result);
    }
  }, [handleSceneChange, processOutput]);

  // -----------------------------------------------------------------------
  // User interactions
  // -----------------------------------------------------------------------

  const handleChoice = useCallback(
    async (choiceIndex: number) => {
      if (processing) return;
      const engine = engineRef.current;
      if (!engine) return;

      setProcessing(true);
      try {
        const result = engine.submitChoice(choiceIndex);

        if (result.type === "scene_change" && result.nextScene) {
          await handleSceneChange(result.nextScene);
        } else {
          processOutput(result);
        }
      } finally {
        setProcessing(false);
      }
    },
    [handleSceneChange, processOutput, processing]
  );

  const handlePageBreak = useCallback(async () => {
    if (processing) return;
    const engine = engineRef.current;
    if (!engine) return;

    setProcessing(true);
    try {
      // Clear previous text on page break
      setTextHistory([]);

      const result = engine.submitPageBreak();

      if (result.type === "scene_change" && result.nextScene) {
        await handleSceneChange(result.nextScene);
      } else {
        processOutput(result);
      }
    } finally {
      setProcessing(false);
    }
  }, [handleSceneChange, processOutput, processing]);

  // -----------------------------------------------------------------------
  // Save / Load
  // -----------------------------------------------------------------------

  const saveToLocalStorage = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const saveData: SaveSlot = {
      state: engine.getState(),
      textHistory,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(autoSaveKey(gameSlug), JSON.stringify(saveData));
    } catch {
      // localStorage might be full
    }
  }, [gameSlug, textHistory]);

  const saveToSupabase = useCallback(async (slotName: string) => {
    const engine = engineRef.current;
    if (!engine || !user || !isSupabaseConfigured()) return;

    const supabase = createClient();
    if (!supabase) return;

    const state = engine.getState();

    const payload: Record<string, unknown> = {
      user_id: user.id,
      game_id: game.id,
      slot_name: slotName,
      current_scene: state.currentScene,
      variables: state.variables,
      choice_history: state.choiceHistory,
    };

    await (supabase.from("save_data") as ReturnType<typeof supabase.from>).upsert(
      payload as never,
      { onConflict: "user_id,game_id,slot_name" }
    );
  }, [user, game.id]);

  const saveToSlot = useCallback(
    (slot: number) => {
      const engine = engineRef.current;
      if (!engine) return;

      const saveData: SaveSlot = {
        state: engine.getState(),
        textHistory,
        timestamp: Date.now(),
      };

      if (saveStatusTimerRef.current) {
        clearTimeout(saveStatusTimerRef.current);
      }

      try {
        localStorage.setItem(manualSlotKey(gameSlug, slot), JSON.stringify(saveData));
        if (user) {
          void saveToSupabase(String(slot));
        }
        setSaveStatus("saved");
        setSaveToast("saved");
      } catch {
        setSaveStatus("error");
        setSaveToast("error");
      }

      setSaveDialogOpen(false);
      saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
      if (saveToastTimerRef.current) {
        clearTimeout(saveToastTimerRef.current);
      }
      saveToastTimerRef.current = setTimeout(() => setSaveToast("idle"), 3000);
    },
    [gameSlug, textHistory, user, saveToSupabase]
  );

  const handleSave = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const loadFromSlot = useCallback(
    async (slot: number) => {
      const engine = engineRef.current;
      if (!engine) return;

      setLoadDialogOpen(false);
      setError(null);

      const saveData = readSlot(manualSlotKey(gameSlug, slot));
      if (!saveData) {
        setInfo("That save slot is empty.");
        return;
      }

      try {
        setLoading(true);
        await loadSceneIntoEngine(saveData.state.currentScene);
        engine.loadState(saveData.state);
        setTextHistory(saveData.textHistory);
        setLoading(false);
        await continueExecution();
      } catch {
        setLoading(false);
        setError("Failed to load save data.");
      }
    },
    [gameSlug, loadSceneIntoEngine, continueExecution]
  );

  const loadFromAutoSave = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    setLoadDialogOpen(false);
    setError(null);

    const saveData = readSlot(autoSaveKey(gameSlug));
    if (!saveData) {
      setInfo("No auto-save found.");
      return;
    }

    try {
      setLoading(true);
      await loadSceneIntoEngine(saveData.state.currentScene);
      engine.loadState(saveData.state);
      setTextHistory(saveData.textHistory);
      setLoading(false);
      await continueExecution();
    } catch {
      setLoading(false);
      setError("Failed to load auto-save.");
    }
  }, [gameSlug, loadSceneIntoEngine, continueExecution]);

  const handleLoad = useCallback(() => {
    setLoadDialogOpen(true);
  }, []);

  // -----------------------------------------------------------------------
  // Restart
  // -----------------------------------------------------------------------

  const handleRestart = useCallback(() => {
    setRestartDialogOpen(true);
  }, []);

  const confirmRestart = useCallback(async () => {
    setRestartDialogOpen(false);
    setError(null);
    setInfo(null);

    // Clear all save data for this game
    localStorage.removeItem(autoSaveKey(gameSlug));
    for (let i = 0; i < MANUAL_SLOT_COUNT; i++) {
      localStorage.removeItem(manualSlotKey(gameSlug, i));
    }

    // Reset UI state
    setTextHistory([]);
    setOutput(null);
    setPaywallActive(false);
    setCurrentScene("");
    setSaveStatus("idle");

    // Create a fresh engine and reload the startup scene
    const engine = new GameEngine();
    engineRef.current = engine;
    loadedScenesRef.current = new Set();

    setLoading(true);
    const loaded = await loadSceneIntoEngine("startup");
    if (!loaded) {
      setLoading(false);
      return;
    }

    const result = engine.startGame("startup");
    setLoading(false);

    if (result.type === "scene_change" && result.nextScene) {
      await handleSceneChange(result.nextScene);
    } else {
      processOutput(result);
    }
  }, [gameSlug, loadSceneIntoEngine, handleSceneChange, processOutput]);

  // -----------------------------------------------------------------------
  // Stats
  // -----------------------------------------------------------------------

  const handleStats = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    // Open the panel immediately so the user sees it right away
    setStatsOpen(true);

    // Fetch stats scene directly — don't use fetchScene/loadSceneIntoEngine
    // because those trigger paywall side effects on 403 responses.
    // choicescript_stats is metadata, not premium content.
    if (!loadedScenesRef.current.has("choicescript_stats")) {
      setStatsLoading(true);
      try {
        const response = await fetch(
          `/api/games/${gameSlug}/scenes/choicescript_stats`
        );
        if (response.ok) {
          const text = await response.text();
          if (text.trim()) {
            const ast = parseScene(text);
            engine.loadScene("choicescript_stats", ast);
            loadedScenesRef.current.add("choicescript_stats");
          }
        }
      } catch {
        // Stats scene unavailable — panel will show fallback
      }
      setStatsLoading(false);
    }

    const display = engine.getStatsDisplay();
    setStats(display);
  }, [gameSlug]);

  // -----------------------------------------------------------------------
  // Font size persistence
  // -----------------------------------------------------------------------

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
    localStorage.setItem(FONT_SIZE_KEY, String(size));
  }, []);

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const engine = new GameEngine();
      engineRef.current = engine;

      // Check for saved game in localStorage (auto-save slot)
      let savedSlot: SaveSlot | null = null;
      try {
        const raw = localStorage.getItem(autoSaveKey(gameSlug));
        if (raw) {
          savedSlot = JSON.parse(raw) as SaveSlot;
        }
      } catch {
        // Corrupted save data — start fresh
      }

      if (savedSlot) {
        // Restore from save: load the saved scene
        const savedScene = savedSlot.state.currentScene;
        const sceneLoaded = await loadSceneIntoEngine(savedScene);
        if (cancelled) return;

        if (sceneLoaded) {
          try {
            engine.loadState(savedSlot.state);
          } catch {
            // Corrupted save state — fall through to fresh start
            savedSlot = null;
          }
        }

        if (savedSlot && sceneLoaded) {
          setTextHistory(savedSlot.textHistory);
          setLoading(false);

          // Continue execution from the saved position
          const result = engine.continueExecution();
          if (cancelled) return;

          if (result.type === "scene_change" && result.nextScene) {
            await handleSceneChange(result.nextScene);
          } else {
            processOutput(result);
          }
          return;
        }
        // If saved scene failed to load or state was corrupted, fall through to fresh start
      }

      // Fresh start: load startup scene
      const startupLoaded = await loadSceneIntoEngine("startup");
      if (cancelled || !startupLoaded) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Start the game
      const result = engine.startGame("startup");

      if (cancelled) return;
      setLoading(false);

      if (result.type === "scene_change" && result.nextScene) {
        await handleSceneChange(result.nextScene);
      } else {
        processOutput(result);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSlug]);

  // -----------------------------------------------------------------------
  // Auto-save
  // -----------------------------------------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      if (engineRef.current && output) {
        saveToLocalStorage();
        if (user) {
          void saveToSupabase("auto");
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [output, saveToLocalStorage, saveToSupabase, user]);

  // -----------------------------------------------------------------------
  // Paywall
  // -----------------------------------------------------------------------

  const handlePurchaseComplete = useCallback(() => {
    setPaywallActive(false);
    // Re-trigger scene load after purchase
    const engine = engineRef.current;
    if (engine) {
      const state = engine.getState();
      void handleSceneChange(state.currentScene);
    }
  }, [handleSceneChange]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (paywallActive) {
    return <PaywallScreen game={game} onPurchaseComplete={handlePurchaseComplete} />;
  }

  return (
    <div className="bg-background pt-14">
      <Toolbar
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onSave={handleSave}
        onLoad={handleLoad}
        onStats={handleStats}
        onRestart={handleRestart}
        saveStatus={saveStatus}
      />

      <SaveToast status={saveToast} onDismiss={() => setSaveToast("idle")} />

      {/* Chapter indicator */}
      {currentScene && currentScene !== "startup" && (
        <div className="w-full max-w-[700px] mx-auto px-4 pt-4">
          <p className="text-xs font-sans text-gold/60 tracking-widest uppercase">
            {currentScene.replace(/_/g, " ")}
          </p>
        </div>
      )}

      <main className="w-full max-w-[700px] mx-auto px-4 py-6 pb-8">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-sans">
                Loading...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="shrink-0 text-destructive/70 hover:text-destructive transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Info state */}
        {info && !loading && (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground flex items-start justify-between gap-3">
            <p>{info}</p>
            <button
              onClick={() => setInfo(null)}
              aria-label="Dismiss message"
              className="shrink-0 text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Text history */}
        {!loading && textHistory.map((block) => (
          <div key={block.id} className="mb-4">
            <TextDisplay text={block.text} fontSize={fontSize} />
          </div>
        ))}

        {/* Current output interactions */}
        {!loading && output && (
          <>
            {/* Choice buttons */}
            {output.type === "choice" && output.choices && (
              <ChoiceButtons choices={output.choices} onSelect={handleChoice} disabled={processing} />
            )}

            {/* Page break */}
            {output.type === "page_break" && (
              <div className="flex justify-center py-8">
                <Button
                  onClick={handlePageBreak}
                  disabled={processing}
                  className="px-8 h-11 bg-gold text-background hover:bg-gold/90 font-serif text-base transition-all duration-200 shadow-md shadow-gold/10"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Ending */}
            {output.type === "ending" && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-px bg-gold mx-auto" />
                <p className="font-display text-xl text-gold">
                  The End
                </p>
                <div className="w-16 h-px bg-gold mx-auto" />
                <p className="text-sm text-muted-foreground font-sans mt-4">
                  Thank you for playing{" "}
                  <span className="text-foreground">{game.title}</span>.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Play Again
                </Button>
              </div>
            )}

            {/* Input text */}
            {output.type === "input_text" && output.variable && (
              <InputPrompt
                variable={output.variable}
                onSubmit={(text) => {
                  const engine = engineRef.current;
                  if (!engine) return;
                  const result = engine.submitInput(text);
                  processOutput(result);
                }}
              />
            )}
          </>
        )}

        {/* Scroll anchor */}
        <div ref={contentEndRef} />
      </main>

      {/* Stats panel */}
      <StatsPanel
        stats={stats}
        open={statsOpen}
        loading={statsLoading}
        onClose={() => setStatsOpen(false)}
      />

      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Game</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            {Array.from({ length: MANUAL_SLOT_COUNT }, (_, i) => {
              const slot = readSlot(manualSlotKey(gameSlug, i));
              return (
                <button
                  key={i}
                  onClick={() => saveToSlot(i)}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-card/80"
                >
                  <span className="text-sm font-sans text-foreground">
                    Slot {i + 1}
                  </span>
                  <span className="text-xs font-sans text-muted-foreground">
                    {slot ? formatTimestamp(slot.timestamp) : "Empty"}
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* Load dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Game</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            {/* Auto-save slot */}
            {(() => {
              const autoSlot = readSlot(autoSaveKey(gameSlug));
              return (
                <button
                  onClick={() => { if (autoSlot) void loadFromAutoSave(); }}
                  disabled={!autoSlot}
                  className="flex items-center justify-between rounded-lg border border-gold/30 bg-card px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-sm font-sans text-foreground">
                    Auto-save
                  </span>
                  <span className="text-xs font-sans text-muted-foreground">
                    {autoSlot ? formatTimestamp(autoSlot.timestamp) : "Empty"}
                  </span>
                </button>
              );
            })()}
            {/* Manual save slots */}
            {Array.from({ length: MANUAL_SLOT_COUNT }, (_, i) => {
              const slot = readSlot(manualSlotKey(gameSlug, i));
              return (
                <button
                  key={i}
                  onClick={() => { if (slot) void loadFromSlot(i); }}
                  disabled={!slot}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-sm font-sans text-foreground">
                    Slot {i + 1}
                  </span>
                  <span className="text-xs font-sans text-muted-foreground">
                    {slot ? formatTimestamp(slot.timestamp) : "Empty"}
                  </span>
                </button>
              );
            })}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* Restart confirmation dialog */}
      <Dialog open={restartDialogOpen} onOpenChange={setRestartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restart Game</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-sans py-2">
            Are you sure you want to restart? All save data for this game will be
            deleted and you will begin from the first passage.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestartDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmRestart()}
            >
              Restart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InputPrompt sub-component
// ---------------------------------------------------------------------------

interface InputPromptProps {
  variable: string;
  onSubmit: (text: string) => void;
}

const NAME_MAX_LENGTH = 30;
const VALID_NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ\u0100-\u024F\u1E00-\u1EFF' -]+$/;

function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

function validateName(input: string): string | null {
  if (!input.trim()) return "Please enter a name.";
  if (input.length > NAME_MAX_LENGTH) return `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  if (!VALID_NAME_RE.test(input)) return "Name may only contain letters, spaces, hyphens, and apostrophes.";
  return null;
}

function InputPrompt({ variable, onSubmit }: InputPromptProps) {
  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = stripHtmlTags(e.target.value).slice(0, NAME_MAX_LENGTH);
    setValue(sanitized);
    if (errorMessage) {
      setErrorMessage(validateName(sanitized));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateName(value);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);
    onSubmit(value.trim());
    setValue("");
  };

  const hasError = errorMessage !== null;

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-3">
      <label htmlFor={`input-${variable}`} className="block text-sm text-muted-foreground font-sans">
        Enter your response:
      </label>
      <input
        id={`input-${variable}`}
        type="text"
        maxLength={NAME_MAX_LENGTH}
        value={value}
        onChange={handleChange}
        className={`w-full h-11 rounded-lg border bg-card px-4 text-foreground font-serif text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
          hasError
            ? "border-red-500 focus:ring-red-500/50 focus:border-red-500 animate-[shake_0.3s_ease-in-out]"
            : "border-border focus:ring-gold/50 focus:border-gold"
        }`}
        placeholder="Type here..."
        autoFocus
      />
      <div className="flex items-center justify-between font-sans">
        {hasError ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : (
          <span />
        )}
        <p className={`text-xs ${value.length >= NAME_MAX_LENGTH ? "text-red-500" : "text-muted-foreground"}`}>
          {value.length}/{NAME_MAX_LENGTH}
        </p>
      </div>
      <Button
        type="submit"
        className="bg-gold text-background hover:bg-gold/90"
      >
        Submit
      </Button>
    </form>
  );
}
