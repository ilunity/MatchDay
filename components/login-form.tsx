"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

const RESEND_COOLDOWN_SECONDS = 60;

type LoginMode = "magic-link" | "password";

type LoginFormProps = {
  passwordLoginEnabled: boolean;
  passwordRegistrationEnabled: boolean;
};

export function LoginForm({
  passwordLoginEnabled,
  passwordRegistrationEnabled,
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [mode, setMode] = useState<LoginMode>(
    passwordLoginEnabled ? "password" : "magic-link"
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }

  function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("nodemailer", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        const message = getAuthErrorMessage(result.error, result.code);
        setError(message);
        toast.error(message);
      } else {
        setSent(true);
        startResendCooldown();
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        const message = getAuthErrorMessage(result.error, result.code);
        setError(message);
        toast.error(message);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleResend() {
    if (resendCooldown > 0 || pending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await signIn("nodemailer", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        const message = getAuthErrorMessage(result.error, result.code);
        setError(message);
        toast.error(message);
      } else {
        toast.success(ru.resendMagicLinkSuccess);
        startResendCooldown();
      }
    });
  }

  const showModeToggle = passwordLoginEnabled;

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {sent && mode === "magic-link" ? ru.magicLinkSent : ru.login}
          </CardTitle>
          {!sent && (
            <CardDescription>
              {mode === "password"
                ? ru.loginWithPassword
                : ru.loginDescription}
            </CardDescription>
          )}
        </CardHeader>
        {sent && mode === "magic-link" ? (
          <CardContent className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-border/80 bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <p>{ru.checkEmail}</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending || resendCooldown > 0}
              onClick={handleResend}
            >
              {pending
                ? ru.loading
                : resendCooldown > 0
                  ? ru.resendMagicLinkCooldown(resendCooldown)
                  : ru.resendMagicLink}
            </Button>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            {showModeToggle && (
              <div className="flex rounded-lg border p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === "magic-link"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setMode("magic-link");
                    setError(null);
                  }}
                >
                  {ru.loginWithMagicLink}
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === "password"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setMode("password");
                    setError(null);
                  }}
                >
                  {ru.loginWithPassword}
                </button>
              </div>
            )}

            {mode === "password" && passwordLoginEnabled ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{ru.username}</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder={ru.usernamePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{ru.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder={ru.passwordPlaceholder}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? ru.loading : ru.signInWithPassword}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{ru.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={ru.emailPlaceholder}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? ru.loading : ru.sendMagicLink}
                </Button>
              </form>
            )}

            {passwordRegistrationEnabled && (
              <p className="text-center text-sm text-muted-foreground">
                {ru.noAccount}{" "}
                <Link
                  href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-medium text-primary hover:underline"
                >
                  {ru.registerLink}
                </Link>
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
