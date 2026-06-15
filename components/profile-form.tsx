"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateUserName } from "@/actions/user";
import { AvatarField } from "@/components/avatar-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

type ProfileFormProps = {
  userId: string;
  initialName?: string | null;
  initialAvatarUrl?: string;
};

export function ProfileForm({
  userId,
  initialName,
  initialAvatarUrl,
}: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("name", name);

    startTransition(async () => {
      const result = await updateUserName(formData);
      if (!result.success) {
        setError(result.error ?? ru.errorGeneric);
        return;
      }

      await update({ name: result.name, avatarKey: result.avatarKey ?? null });
      toast.success(ru.profileSaved);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AvatarField
            userId={userId}
            userName={name}
            initialAvatarUrl={initialAvatarUrl}
          />
          <div className="space-y-2">
            <Label htmlFor="profileName">{ru.yourName}</Label>
            <Input
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ru.guestNamePlaceholder}
              required
            />
            <p className="text-sm text-muted-foreground">{ru.editNameHint}</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? ru.loading : ru.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
