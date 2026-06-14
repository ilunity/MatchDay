import Link from "next/link";
import { auth } from "@/lib/auth";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { UserBadge } from "@/components/user-badge";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {ru.appName}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
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
