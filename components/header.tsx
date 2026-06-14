import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";

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
              <Link href="/events/new">
                <Button size="sm">{ru.createEvent}</Button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  {ru.logout}
                </Button>
              </form>
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
