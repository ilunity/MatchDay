"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { registerWithPassword } from "@/actions/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("username", username);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    formData.set("name", name);

    startTransition(async () => {
      const result = await registerWithPassword(formData);
      if (!result.success) {
        setError(result.error ?? ru.errorGeneric);
        return;
      }

      const signInResult = await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: false,
      });

      if (signInResult?.error) {
        const message = getAuthErrorMessage(
          signInResult.error,
          signInResult.code
        );
        setError(message);
        toast.error(message);
        return;
      }

      if (signInResult?.url) {
        router.push(signInResult.url);
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    });
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{ru.register}</CardTitle>
          <CardDescription>{ru.registerDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registerUsername">{ru.username}</Label>
              <Input
                id="registerUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder={ru.usernamePlaceholder}
              />
              <p className="text-sm text-muted-foreground">{ru.usernameHint}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerName">{ru.yourName}</Label>
              <Input
                id="registerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder={ru.guestNamePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerPassword">{ru.password}</Label>
              <Input
                id="registerPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder={ru.passwordPlaceholder}
              />
              <p className="text-sm text-muted-foreground">{ru.passwordHint}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerConfirmPassword">{ru.confirmPassword}</Label>
              <Input
                id="registerConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder={ru.passwordPlaceholder}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? ru.loading : ru.register}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {ru.alreadyHaveAccount}{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium text-primary hover:underline"
            >
              {ru.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
