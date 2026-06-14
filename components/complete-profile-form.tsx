"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { updateUserName } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";

export function CompleteProfileForm({ open }: { open: boolean }) {
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
      window.location.reload();
    });
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{ru.completeProfileTitle}</DialogTitle>
          <DialogDescription>{ru.completeProfileHint}</DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
