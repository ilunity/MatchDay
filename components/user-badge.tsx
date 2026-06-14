"use client";

import { useState, useTransition } from "react";
import { signOut, useSession } from "next-auth/react";
import { updateUserName } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";
import { ChevronDown, LogOut } from "lucide-react";

export function UserBadge({ initialName }: { initialName?: string | null }) {
  const { update } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayName = initialName?.trim() || ru.setYourName;

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
        >
          <span className="max-w-[140px] truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="userBadgeName" className="text-xs">
                {ru.editName}
              </Label>
              <Input
                id="userBadgeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ru.guestNamePlaceholder}
                required
                className="h-8"
              />
              <p className="text-xs text-muted-foreground">{ru.editNameHint}</p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" size="sm" className="w-full" disabled={pending}>
              {pending ? ru.loading : ru.save}
            </Button>
          </form>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => signOut({ redirectTo: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {ru.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
