"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, login } from "@/lib/api";
import { isAuthenticated, setToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/atoms";

const LOGIN_HEADING = "Welcome to Invoice Ledger";
const HIGHLIGHT = "Invoice Ledger";
const HIGHLIGHT_START = LOGIN_HEADING.indexOf(HIGHLIGHT);
const HIGHLIGHT_END = HIGHLIGHT_START + HIGHLIGHT.length;
const TYPEWRITER_DELAY_MS = 50;

function LoginHeading() {
  const [charCount, setCharCount] = useState(0);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setCharCount(LOGIN_HEADING.length);
      return;
    }

    if (charCount >= LOGIN_HEADING.length) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCharCount((current) => current + 1);
    }, TYPEWRITER_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [charCount]);

  const visible = LOGIN_HEADING.slice(0, charCount);
  const before = visible.slice(0, Math.min(visible.length, HIGHLIGHT_START));
  const highlight =
    visible.length > HIGHLIGHT_START
      ? visible.slice(
          HIGHLIGHT_START,
          Math.min(visible.length, HIGHLIGHT_END),
        )
      : "";
  const after =
    visible.length > HIGHLIGHT_END ? visible.slice(HIGHLIGHT_END) : "";
  const isTyping = charCount < LOGIN_HEADING.length;

  return (
    <h1
      aria-label={LOGIN_HEADING}
      className="min-h-14 text-center text-xl font-semibold tracking-tight"
    >
      {before}
      {highlight ? <span className="text-green-500">{highlight}</span> : null}
      {after}
      {isTyping ? (
        <span aria-hidden className="animate-pulse">
          |
        </span>
      ) : null}
    </h1>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim()) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { token } = await login(password);
      setToken(token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid password. Please try again.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginHeading />
        <Card className="w-full shadow-sm">
          <CardHeader className="items-center justify-items-center text-center">
            <BrandLogo size="lg" className="mb-3" />
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter the shared password to access the ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Input
                  autoComplete="current-password"
                  className="pr-10"
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                className={cn("w-full")}
                disabled={!password.trim() || isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
