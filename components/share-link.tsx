"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ru } from "@/lib/i18n/ru";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input readOnly value={url} className="min-h-11 font-mono text-sm" />
      <Button
        type="button"
        variant="outline"
        onClick={handleCopy}
        className="min-h-11 w-full shrink-0 sm:w-auto"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? ru.copied : ru.copyLink}
      </Button>
    </div>
  );
}
