"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthModal } from "@/components/auth/auth-modal";
import type { Purchase, SaveData } from "@/types/database";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [saves, setSaves] = useState<SaveData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingSave, setDeletingSave] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ---- fetch user data -----------------------------------------------------
  const fetchUserData = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setLoadingData(false);
      return;
    }

    const supabase = createClient();
    setLoadingData(true);

    const [purchaseResult, saveResult] = await Promise.all([
      supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("save_data")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false }),
    ]);

    if (purchaseResult.data) setPurchases(purchaseResult.data);
    if (saveResult.data) setSaves(saveResult.data);

    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      setAuthModalOpen(true);
      return;
    }
    fetchUserData();
  }, [authLoading, user, fetchUserData]);

  // ---- delete save ---------------------------------------------------------
  const handleDeleteSave = async (saveId: string) => {
    if (!isSupabaseConfigured()) return;
    setDeletingSave(saveId);

    const supabase = createClient();
    const { error } = await supabase
      .from("save_data")
      .delete()
      .eq("id", saveId);

    if (!error) {
      setSaves((prev) => prev.filter((s) => s.id !== saveId));
    }
    setDeletingSave(null);
  };

  // ---- load save (navigate to play with slot info) -------------------------
  const handleLoadSave = (save: SaveData) => {
    router.push(`/play?loadSave=${save.id}`);
  };

  // ---- sign out ------------------------------------------------------------
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // ---- loading / redirect --------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Sign in to view your <span className="text-gold">Account</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Please sign in or create an account to access your profile, purchases,
          and saved games.
        </p>
        <Button
          className="bg-gold text-background hover:bg-gold/90 min-h-[44px] px-8"
          onClick={() => setAuthModalOpen(true)}
        >
          Sign In / Sign Up
        </Button>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }

  // ---- render --------------------------------------------------------------
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        Your <span className="text-gold">Account</span>
      </h1>

      {/* Profile Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Purchases Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Purchases</CardTitle>
          <CardDescription>Games you have unlocked</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <p className="text-sm text-muted-foreground">Loading purchases...</p>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have not purchased any games yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {purchases.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Game ID: {p.game_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status:{" "}
                      <span
                        className={
                          p.status === "captured"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }
                      >
                        {p.status}
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Save Slots Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Save Slots</CardTitle>
          <CardDescription>Your saved game progress</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <p className="text-sm text-muted-foreground">Loading saves...</p>
          ) : saves.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved games yet. Start playing to create a save.
            </p>
          ) : (
            <ul className="space-y-3">
              {saves.map((save) => (
                <li
                  key={save.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{save.slot_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Scene: {save.current_scene}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved: {new Date(save.saved_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gold/30 hover:bg-gold/10"
                      onClick={() => handleLoadSave(save)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingSave === save.id}
                      onClick={() => handleDeleteSave(save.id)}
                    >
                      {deletingSave === save.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
