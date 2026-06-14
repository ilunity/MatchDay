"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { ru } from "@/lib/i18n/ru";
import { ChevronDown, LogOut, User } from "lucide-react";

type UserBadgeProps = {
  userId: string;
  initialName?: string | null;
  avatarUrl?: string;
};

export function UserBadge({ userId, initialName, avatarUrl }: UserBadgeProps) {
  const displayName = initialName?.trim() || ru.setYourName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 gap-2 text-muted-foreground"
        >
          <UserAvatar
            userId={userId}
            name={displayName}
            avatarUrl={avatarUrl}
            size={28}
          />
          <span className="max-w-[96px] truncate sm:max-w-[140px]">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            {ru.profile}
          </Link>
        </DropdownMenuItem>
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
