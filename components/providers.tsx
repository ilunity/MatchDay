"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { UnsavedChangesProvider } from "@/components/unsaved-changes-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UnsavedChangesProvider>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
        <Toaster position="top-center" richColors />
      </UnsavedChangesProvider>
    </SessionProvider>
  );
}
