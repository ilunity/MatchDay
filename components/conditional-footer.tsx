"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

const AUTH_PATHS = ["/login", "/register", "/error"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function ConditionalFooter() {
  const pathname = usePathname();

  if (isAuthPath(pathname)) {
    return null;
  }

  return <Footer />;
}
