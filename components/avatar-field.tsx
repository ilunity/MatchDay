"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { ru } from "@/lib/i18n/ru";

type AvatarFieldProps = {
  userId: string;
  userName?: string | null;
  initialAvatarUrl?: string;
};

export function AvatarField({
  userId,
  userName,
  initialAvatarUrl,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialAvatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
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
    setRemoveAvatar(false);
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPreviewUrl(undefined);
    setRemoveAvatar(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  const showUploadedPreview = Boolean(previewUrl && !removeAvatar);

  return (
    <div className="space-y-2">
      <Label htmlFor="avatar">{ru.avatar}</Label>
      {removeAvatar && <input type="hidden" name="removeAvatar" value="on" />}
      <div className="flex items-center gap-4">
        {showUploadedPreview ? (
          <UserAvatar userId={userId} name={userName} avatarUrl={previewUrl} size={80} />
        ) : (
          <UserAvatar userId={userId} name={userName} size={80} />
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            {showUploadedPreview ? ru.changeAvatar : ru.uploadAvatar}
          </Button>
          {showUploadedPreview && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              {ru.removeAvatar}
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{ru.avatarHint}</p>
      <input
        ref={inputRef}
        id="avatar"
        name="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
