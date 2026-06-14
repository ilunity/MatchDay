"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateUserName } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";

export function CompleteProfilePageForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("name", name);

    startTransition(async () => {
      const result = await updateUserName(formData);
      if (!result.success) {
        setError(result.error ?? ru.errorGeneric);
        return;
      }

      await update({ name: result.name });
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{ru.completeProfileTitle}</CardTitle>
          <CardDescription>{ru.completeProfileHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">{ru.yourName}</Label>
              <Input
                id="profileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ru.guestNamePlaceholder}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? ru.loading : ru.continue}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
