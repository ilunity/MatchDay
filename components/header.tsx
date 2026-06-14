import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/auth";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { UserBadge } from "@/components/user-badge";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="cursor-pointer text-xl font-bold tracking-tight">
          {ru.appName}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                {ru.dashboard}
              </Link>
              <UserBadge initialName={session.user.name} />
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline">
                {ru.login}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
