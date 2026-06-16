"use client";

import { useState, useTransition } from "react";
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

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          <CardContent>
            <div className="flex gap-3 rounded-lg border border-border/80 bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <p>{ru.checkEmail}</p>
            </div>
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
