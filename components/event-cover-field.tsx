"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";

type EventCoverFieldProps = {
  initialCoverUrl?: string;
  compact?: boolean;
};

export function EventCoverField({
  initialCoverUrl,
  compact = false,
}: EventCoverFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialCoverUrl);
  const [removeCover, setRemoveCover] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setPreviewUrl(nextUrl);
    setRemoveCover(false);
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPreviewUrl(undefined);
    setRemoveCover(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  const showPreview = previewUrl && !removeCover;

  const previewClass = compact
    ? "relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-muted"
    : "relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted";

  const placeholderClass = compact
    ? "flex aspect-[3/2] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/50"
    : "flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 px-4 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50";

  return (
    <div className="space-y-2">
      <Label htmlFor="cover">{ru.cover}</Label>
      {removeCover && <input type="hidden" name="removeCover" value="on" />}
      {showPreview ? (
        <div className={previewClass}>
          <Image
            src={previewUrl}
            alt={ru.cover}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={placeholderClass}
        >
          <span>{ru.uploadCover}</span>
          {!compact && <span className="text-xs">{ru.coverHint}</span>}
        </button>
      )}
      <div className={compact ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          {showPreview ? ru.changeCover : ru.uploadCover}
        </Button>
        {showPreview && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            {ru.removeCover}
          </Button>
        )}
      </div>
      {compact && (
        <p className="text-xs text-muted-foreground">{ru.coverHint}</p>
      )}
      <input
        ref={inputRef}
        id="cover"
        name="cover"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
