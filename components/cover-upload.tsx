"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ru } from "@/lib/i18n/ru";

export function CoverUpload({
  eventId,
  currentCoverUrl,
  isOwner,
}: {
  eventId: string;
  currentCoverUrl?: string;
  isOwner: boolean;
}) {
  const [coverUrl, setCoverUrl] = useState(currentCoverUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOwner && !coverUrl) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("cover", file);

    try {
      const res = await fetch(`/api/events/${eventId}/cover`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = (await res.json()) as { key: string };
        setCoverUrl(`/api/storage/${data.key}`);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/cover`, { method: "DELETE" });
      if (res.ok) setCoverUrl(undefined);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {coverUrl && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={coverUrl}
            alt={ru.cover}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      {isOwner && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? ru.uploading : ru.uploadCover}
            </Button>
            {coverUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                {ru.removeCover}
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">{ru.coverHint}</p>
        </div>
      )}
    </div>
  );
}
