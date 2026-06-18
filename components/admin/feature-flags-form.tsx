"use client";

import { useState, useTransition } from "react";
import { updateFeatureFlag } from "@/actions/feature-flags";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { FeatureFlagKey } from "@/lib/feature-flags.registry";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

type FlagRow = {
  key: FeatureFlagKey;
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

const flagCopy: Record<
  FeatureFlagKey,
  { title: string; description: string }
> = {
  smtpHtml: {
    title: ru.adminFlagsSmtpHtmlTitle,
    description: ru.adminFlagsSmtpHtmlDescription,
  },
  smtpLog: {
    title: ru.adminFlagsSmtpLogTitle,
    description: ru.adminFlagsSmtpLogDescription,
  },
  passwordRegistration: {
    title: ru.adminFlagsPasswordRegistrationTitle,
    description: ru.adminFlagsPasswordRegistrationDescription,
  },
  passwordLogin: {
    title: ru.adminFlagsPasswordLoginTitle,
    description: ru.adminFlagsPasswordLoginDescription,
  },
};

export function FeatureFlagsForm({ flags }: { flags: FlagRow[] }) {
  const [pendingKey, setPendingKey] = useState<FeatureFlagKey | null>(null);
  const [, startTransition] = useTransition();

  function handleToggle(key: FeatureFlagKey, enabled: boolean) {
    setPendingKey(key);
    startTransition(async () => {
      const result = await updateFeatureFlag(key, enabled);
      setPendingKey(null);

      if (!result.success) {
        toast.error(result.error ?? ru.errorGeneric);
        return;
      }

      toast.success(ru.adminFlagsSaved);
    });
  }

  return (
    <div className="space-y-4">
      {flags.map((flag) => {
        const copy = flagCopy[flag.key];
        return (
          <div
            key={flag.key}
            className="flex flex-row items-start gap-4 rounded-lg border p-4"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={flag.key}>{copy.title}</Label>
              <p className="text-sm text-muted-foreground">{copy.description}</p>
              {flag.updatedAt ? (
                <p className="text-xs text-muted-foreground">
                  {ru.adminFlagsUpdatedAt(flag.updatedAt, flag.updatedBy)}
                </p>
              ) : null}
            </div>
            <Switch
              id={flag.key}
              checked={flag.enabled}
              disabled={pendingKey === flag.key}
              onCheckedChange={(checked) => handleToggle(flag.key, checked)}
            />
          </div>
        );
      })}
    </div>
  );
}
