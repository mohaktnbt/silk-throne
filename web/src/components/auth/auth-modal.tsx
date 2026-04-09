"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validateFields = (isSignUp = false): boolean => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!forgotMode) {
      if (!password) {
        errors.password = "Password is required";
      } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      if (isSignUp && password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateFields()) return;
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        onOpenChange(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError("Auth not configured");
        setLoading(false);
        return;
      }
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent! Check your inbox.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateFields(true)) return;
    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccess("Check your email for a confirmation link!");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            Welcome to <span className="text-gold">The Silk Throne</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="mt-4 flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            {forgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4 mt-4" noValidate>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a password reset link.
                </p>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                    aria-invalid={!!fieldErrors.email}
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gold text-background hover:bg-gold/90"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError(null); setSuccess(null); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4 mt-4" noValidate>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                    aria-invalid={!!fieldErrors.email}
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                    aria-invalid={!!fieldErrors.password}
                    className={fieldErrors.password ? "border-destructive" : ""}
                  />
                  {fieldErrors.password && <p className="text-sm text-destructive mt-1">{fieldErrors.password}</p>}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gold text-background hover:bg-gold/90"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(null); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </form>
            )}
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4" noValidate>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                  aria-invalid={!!fieldErrors.email}
                  className={fieldErrors.email ? "border-destructive" : ""}
                />
                {fieldErrors.email && <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                  aria-invalid={!!fieldErrors.password}
                  className={fieldErrors.password ? "border-destructive" : ""}
                />
                {fieldErrors.password && <p className="text-sm text-destructive mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined })); }}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  className={fieldErrors.confirmPassword ? "border-destructive" : ""}
                />
                {fieldErrors.confirmPassword && <p className="text-sm text-destructive mt-1">{fieldErrors.confirmPassword}</p>}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
              <Button
                type="submit"
                className="w-full bg-gold text-background hover:bg-gold/90"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
