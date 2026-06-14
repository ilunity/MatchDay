import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/auth";
import { avatarUrlFromKey } from "@/lib/avatar";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { UserBadge } from "@/components/user-badge";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 min-h-14 items-center justify-between gap-2 px-4 sm:h-16">
        <Link
          href="/"
          className="cursor-pointer truncate text-lg font-bold tracking-tight sm:text-xl"
        >
          {ru.appName}
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                aria-label={ru.dashboard}
                className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:text-foreground sm:px-0"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{ru.dashboard}</span>
              </Link>
              <UserBadge
                userId={session.user.id}
                initialName={session.user.name}
                avatarUrl={avatarUrlFromKey(session.user.avatarKey)}
              />
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline" className="min-h-11">
                {ru.login}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
