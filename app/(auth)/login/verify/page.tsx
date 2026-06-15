import { Suspense } from "react";
import { MagicLinkVerify } from "@/components/magic-link-verify";
import { ru } from "@/lib/i18n/ru";

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          {ru.loading}
        </div>
      }
    >
      <MagicLinkVerify />
    </Suspense>
  );
}
