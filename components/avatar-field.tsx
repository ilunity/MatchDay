"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AvatarCropDialog } from "@/components/avatar-crop-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { validateImageFile } from "@/lib/image-constants";
import { ru } from "@/lib/i18n/ru";

type AvatarFieldProps = {
  userId: string;
  userName?: string | null;
  initialAvatarUrl?: string;
};

function setFileOnInput(input: HTMLInputElement, file: File) {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;
}

function mimeFromFileName(fileName: string): string {
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function avatarValidationMessage(error: "invalid_type" | "too_large"): string {
  if (error === "invalid_type") return ru.avatarInvalidType;
  return ru.avatarTooLarge;
}

export function AvatarField({
  userId,
  userName,
  initialAvatarUrl,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialAvatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropMimeType, setCropMimeType] = useState("image/jpeg");
  const [cropFileName, setCropFileName] = useState("avatar.jpg");
  const [pendingCropUrl, setPendingCropUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (pendingCropUrl) URL.revokeObjectURL(pendingCropUrl);
    };
  }, [objectUrl, pendingCropUrl]);

  function revokePendingCropUrl() {
    if (pendingCropUrl) {
      URL.revokeObjectURL(pendingCropUrl);
      setPendingCropUrl(null);
    }
  }

  function openCropDialog(
    imageSrc: string,
    mimeType: string,
    fileName: string,
    revokeOnCancel?: string
  ) {
    revokePendingCropUrl();
    if (revokeOnCancel) {
      setPendingCropUrl(revokeOnCancel);
    }
    setCropImageSrc(imageSrc);
    setCropMimeType(mimeType);
    setCropFileName(fileName);
    setCropDialogOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(avatarValidationMessage(validationError));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    openCropDialog(nextUrl, file.type, file.name, nextUrl);
  }

  function handleReposition() {
    if (!previewUrl || removeAvatar) return;

    const fileName = previewUrl.startsWith("blob:")
      ? cropFileName
      : "avatar.jpg";
    const mimeType = previewUrl.startsWith("blob:")
      ? cropMimeType
      : mimeFromFileName(previewUrl);

    openCropDialog(previewUrl, mimeType, fileName);
  }

  function handleCropConfirm(file: File, nextPreviewUrl: string) {
    revokePendingCropUrl();

    if (objectUrl) URL.revokeObjectURL(objectUrl);

    setObjectUrl(nextPreviewUrl);
    setPreviewUrl(nextPreviewUrl);
    setRemoveAvatar(false);
    setCropMimeType(file.type);
    setCropFileName(file.name);

    if (inputRef.current) {
      setFileOnInput(inputRef.current, file);
    }
  }

  function handleCropCancel() {
    revokePendingCropUrl();
    setCropImageSrc(null);
    if (inputRef.current) inputRef.current.value = "";
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
            <>
              <Button type="button" variant="outline" size="sm" onClick={handleReposition}>
                {ru.adjustAvatar}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                {ru.removeAvatar}
              </Button>
            </>
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
      <AvatarCropDialog
        open={cropDialogOpen}
        imageSrc={cropImageSrc}
        sourceMimeType={cropMimeType}
        sourceFileName={cropFileName}
        onOpenChange={setCropDialogOpen}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </div>
  );
}
