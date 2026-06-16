"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ru } from "@/lib/i18n/ru";

type UnsavedChangesContextValue = {
  setHasUnsavedChanges: (dirty: boolean) => void;
  confirmIfNeeded: () => Promise<boolean>;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(
  null
);

function isInternalNavigationLink(anchor: HTMLAnchorElement): string | null {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || anchor.target === "_blank") {
    return null;
  }

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }
    if (url.pathname === window.location.pathname && !url.search && !url.hash) {
      return null;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dirty, setDirty] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const setHasUnsavedChanges = useCallback((value: boolean) => {
    setDirty(value);
  }, []);

  const confirmIfNeeded = useCallback((): Promise<boolean> => {
    if (!dirty) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogOpen(true);
    });
  }, [dirty]);

  function closeDialog(leave: boolean) {
    setDialogOpen(false);
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(leave);
  }

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor) {
        return;
      }

      const path = isInternalNavigationLink(anchor);
      if (!path) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      void confirmIfNeeded().then((leave) => {
        if (leave) {
          window.location.assign(path);
        }
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dirty, confirmIfNeeded]);

  return (
    <UnsavedChangesContext.Provider
      value={{ setHasUnsavedChanges, confirmIfNeeded }}
    >
      {children}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog(false);
          }
        }}
      >
        <DialogContent
          className="fixed bottom-0 left-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-b-none border-b-0 sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border-b"
          hideCloseButton
        >
          <DialogHeader className="text-left">
            <DialogTitle>{ru.unsavedChangesTitle}</DialogTitle>
            <DialogDescription>{ru.unsavedChangesDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => closeDialog(false)}
            >
              {ru.unsavedChangesStay}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => closeDialog(true)}
            >
              {ru.unsavedChangesLeave}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
  }
  return context;
}
