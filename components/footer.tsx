import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background/95">
      <div className="container flex flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight hover:underline"
          >
            {ru.appName}
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">{ru.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground"
          >
            {ru.about}
          </Link>
          <Link
            href="/how-it-works"
            className="text-muted-foreground hover:text-foreground"
          >
            {ru.howItWorks}
          </Link>
        </nav>
      </div>

      <div className="border-t">
        <div className="container px-4 py-4">
          <p className="text-xs text-muted-foreground">
            {ru.footer.copyright(year)}
          </p>
        </div>
      </div>
    </footer>
  );
}
