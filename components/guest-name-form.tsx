"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setGuestName } from "@/actions/availability";
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
import { cn } from "@/lib/utils";

export function GuestNameForm({
  eventSlug,
  open,
}: {
  eventSlug: string;
  open: boolean;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("eventSlug", eventSlug);
    formData.set("guestName", name);

    startTransition(async () => {
      const result = await setGuestName(formData);
      if (!result.success) {
        setError(result.error ?? ru.errorGeneric);
      } else {
        window.location.reload();
      }
    });
  }

  return (
    <Dialog open={open}>
      <DialogContent
        hideCloseButton
        className={cn(
          "w-[calc(100%-2rem)] max-w-md rounded-lg",
          "sm:w-full"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{ru.guestName}</DialogTitle>
          <DialogDescription>{ru.guestNameHint}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">{ru.guestName}</Label>
            <Input
              id="guestName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ru.guestNamePlaceholder}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? ru.loading : ru.continue}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">{ru.backHome}</Link>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
