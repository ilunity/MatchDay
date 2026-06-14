"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ru } from "@/lib/i18n/ru";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const label = copied ? ru.copied : ru.copyLink;

  return (
    <div className="flex flex-row gap-2">
      <Input readOnly value={url} className="min-h-11 min-w-0 flex-1 font-mono text-sm" />
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="size-11 shrink-0 sm:size-auto sm:min-h-11 sm:px-4"
            aria-label={label}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}
