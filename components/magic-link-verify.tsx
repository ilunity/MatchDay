"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ru } from "@/lib/i18n/ru";

export function MagicLinkVerify() {
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);

    const hash = window.location.hash.slice(1);
    if (!hash) {
      setCallbackUrl(null);
      return;
    }

    try {
      setCallbackUrl(decodeURIComponent(hash));
    } catch {
      setCallbackUrl(null);
    }
  }, []);

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogin() {
    if (callbackUrl) {
      window.location.href = callbackUrl;
    }
  }

  const copyLabel = copied ? ru.copied : ru.copyLink;

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{ru.magicLinkVerifyTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {callbackUrl ? (
            <>
              <div className="flex gap-3 rounded-lg border border-border/80 bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p>{ru.magicLinkVerifyHint}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" className="w-full" onClick={handleLogin}>
                  {ru.magicLinkVerifyLogin}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleCopy}
                  aria-label={copyLabel}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copyLabel}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border/80 bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
                {ru.magicLinkVerifyMissing}
              </div>
              <Button asChild className="w-full">
                <Link href="/login">{ru.tryLoginAgain}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
