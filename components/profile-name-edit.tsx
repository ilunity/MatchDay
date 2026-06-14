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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";
import { Pencil } from "lucide-react";

export function ProfileNameEdit({ initialName }: { initialName?: string | null }) {
  const { update } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName ?? "");
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
      setOpen(false);
      window.location.reload();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 text-muted-foreground sm:inline-flex"
        >
          <span className="max-w-[120px] truncate">
            {initialName?.trim() || ru.setYourName}
          </span>
          <Pencil className="h-3.5 w-3.5 shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ru.editName}</DialogTitle>
          <DialogDescription>{ru.editNameHint}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editName">{ru.yourName}</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ru.guestNamePlaceholder}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? ru.loading : ru.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
