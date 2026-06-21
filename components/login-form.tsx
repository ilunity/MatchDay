"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Info } from "lucide-react";
import { getPasswordLoginLockStatus } from "@/actions/auth";
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
import { getAuthErrorMessage, getLoginLockoutMessage } from "@/lib/auth-errors";
import { isAllowedAuthEmail } from "@/lib/allowed-email-domains";
import {
  getActiveLockout,
  parseLoginLockoutCode,
  type ParsedLoginLockout,
} from "@/lib/login-lockout-errors";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

const RESEND_COOLDOWN_SECONDS = 60;
const LOCK_STATUS_DEBOUNCE_MS = 400;

type LoginMode = "magic-link" | "password";

type LoginFormProps = {
  passwordLoginEnabled: boolean;
  passwordRegistrationEnabled: boolean;
};

function getLockoutSecondsRemaining(lockout: ParsedLoginLockout | null): number {
  if (!lockout) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((lockout.lockedUntil.getTime() - Date.now()) / 1000)
  );
}

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
  const [lockout, setLockout] = useState<ParsedLoginLockout | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [pending, startTransition] = useTransition();

  const applyLockoutFromStatus = useCallback(
    (ipLockedUntil: string | null, accountLockedUntil: string | null) => {
      const active = getActiveLockout(ipLockedUntil, accountLockedUntil);
      setLockout(active);
      setLockoutSeconds(getLockoutSecondsRemaining(active));
    },
    []
  );

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (mode !== "password" || !passwordLoginEnabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      void getPasswordLoginLockStatus(username).then(
        ({ ipLockedUntil, accountLockedUntil }) => {
          applyLockoutFromStatus(ipLockedUntil, accountLockedUntil);
        }
      );
    }, username ? LOCK_STATUS_DEBOUNCE_MS : 0);

    return () => window.clearTimeout(timer);
  }, [applyLockoutFromStatus, mode, passwordLoginEnabled, username]);

  useEffect(() => {
    if (!lockout || lockoutSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLockoutSeconds((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) {
          void getPasswordLoginLockStatus(username).then(
            ({ ipLockedUntil, accountLockedUntil }) => {
              applyLockoutFromStatus(ipLockedUntil, accountLockedUntil);
            }
          );
        }
        return next;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [applyLockoutFromStatus, lockout, lockoutSeconds, username]);

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }

  function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAllowedAuthEmail(email)) {
      setError(ru.foreignEmailNotAllowed);
      return;
    }

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

    if (isPasswordLoginBlocked) {
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        const parsedLockout = parseLoginLockoutCode(result.code);
        if (parsedLockout) {
          const seconds = getLockoutSecondsRemaining(parsedLockout);
          setLockout(parsedLockout);
          setLockoutSeconds(seconds);
          const message = getLoginLockoutMessage(parsedLockout, seconds);
          toast.error(message);
          return;
        }

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

    if (!isAllowedAuthEmail(email)) {
      setError(ru.foreignEmailNotAllowed);
      return;
    }

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
  const isIpLocked = lockout?.type === "ip" && lockoutSeconds > 0;
  const isAccountLocked = lockout?.type === "account" && lockoutSeconds > 0;
  const isPasswordLoginBlocked = isIpLocked || isAccountLocked;
  const lockoutMessage =
    lockout && lockoutSeconds > 0
      ? getLoginLockoutMessage(lockout, lockoutSeconds)
      : null;

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
                    setLockout(null);
                    setLockoutSeconds(0);
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
                    disabled={isIpLocked}
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
                    disabled={isPasswordLoginBlocked}
                  />
                </div>
                {lockoutMessage && (
                  <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive">
                    <Info
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden
                    />
                    <p>{lockoutMessage}</p>
                  </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={pending || isPasswordLoginBlocked}
                >
                  {pending
                    ? ru.loading
                    : isPasswordLoginBlocked && lockoutMessage
                      ? lockoutMessage
                      : ru.signInWithPassword}
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
                  <p className="text-sm text-muted-foreground">{ru.emailHint}</p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? ru.loading : ru.sendMagicLink}
                </Button>
              </form>
            )}

            {passwordRegistrationEnabled && mode === "password" && (
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
