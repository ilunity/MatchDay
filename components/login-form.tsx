"use client";

import { useEffect, useState, useTransition } from "react";
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
import { MAGIC_LINK_PLAIN_FIELD } from "@/lib/magic-link-request";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

const RESEND_COOLDOWN_SECONDS = 60;

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
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

  function handleSubmit(e: React.FormEvent) {
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
        [MAGIC_LINK_PLAIN_FIELD]: "1",
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

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{sent ? ru.magicLinkSent : ru.login}</CardTitle>
          {!sent && <CardDescription>{ru.loginDescription}</CardDescription>}
        </CardHeader>
        {sent ? (
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
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
          </CardContent>
        )}
      </Card>
    </div>
  );
}
