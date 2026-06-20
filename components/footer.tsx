import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background/95">
      <div className="container flex flex-col gap-3 px-4 py-4 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight hover:underline"
            >
              {ru.appName}
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              {ru.footer.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 text-sm sm:justify-end">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
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
            <span className="ml-6 text-xs text-muted-foreground sm:ml-8">
              {ru.footer.copyright(year)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
