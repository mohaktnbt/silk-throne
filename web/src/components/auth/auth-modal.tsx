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

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateFields = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateFields()) return;
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
            </form>
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
