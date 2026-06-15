"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Crop, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CoverCropDialog } from "@/components/cover-crop-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getImageAspectRatio } from "@/lib/crop-image";
import {
  type CoverAspectPresetId,
  coverAspectPresetById,
  nearestCoverAspectPresetId,
  validateImageFile,
} from "@/lib/image-constants";
import { ru } from "@/lib/i18n/ru";

type EventCoverFieldProps = {
  initialCoverUrl?: string;
  compact?: boolean;
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

function coverValidationMessage(error: "invalid_type" | "too_large"): string {
  if (error === "invalid_type") return ru.coverInvalidType;
  return ru.coverTooLarge;
}

export function EventCoverField({
  initialCoverUrl,
  compact = false,
}: EventCoverFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialCoverUrl);
  const [removeCover, setRemoveCover] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropMimeType, setCropMimeType] = useState("image/jpeg");
  const [cropFileName, setCropFileName] = useState("cover.jpg");
  const [pendingCropUrl, setPendingCropUrl] = useState<string | null>(null);
  const [aspectPresetId, setAspectPresetId] = useState<CoverAspectPresetId>("16:9");

  useEffect(() => {
    if (!initialCoverUrl) return;

    let cancelled = false;
    getImageAspectRatio(initialCoverUrl).then((ratio) => {
      if (!cancelled) {
        setAspectPresetId(nearestCoverAspectPresetId(ratio));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialCoverUrl]);

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
      toast.error(coverValidationMessage(validationError));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    openCropDialog(nextUrl, file.type, file.name, nextUrl);
  }

  function handleReposition() {
    if (!previewUrl || removeCover) return;

    const fileName = previewUrl.startsWith("blob:")
      ? cropFileName
      : "cover.jpg";
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
    setRemoveCover(false);
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
    setRemoveCover(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  const showPreview = previewUrl && !removeCover;

  const aspectRatio = coverAspectPresetById(aspectPresetId).ratio;
  const previewAspectStyle = { aspectRatio: `${aspectRatio}` };

  const previewClass = compact
    ? "relative w-full overflow-hidden rounded-lg bg-muted"
    : "relative w-full overflow-hidden rounded-xl bg-muted";

  const placeholderClass = compact
    ? "flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/50"
    : "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 px-4 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50";

  return (
    <div className="space-y-2">
      <Label htmlFor="cover">{ru.cover}</Label>
      {removeCover && <input type="hidden" name="removeCover" value="on" />}
      {showPreview ? (
        <div className={previewClass} style={previewAspectStyle}>
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
          style={previewAspectStyle}
        >
          <span>{ru.uploadCover}</span>
          {!compact && <span className="text-xs">{ru.coverHint}</span>}
        </button>
      )}
      <div className="flex w-full flex-col gap-2">
        {showPreview ? (
          <>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {ru.changeCover}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleReposition}
              >
                <Crop className="h-4 w-4" />
                {ru.adjustCover}
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              {ru.removeCover}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            {ru.uploadCover}
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
      <CoverCropDialog
        open={cropDialogOpen}
        imageSrc={cropImageSrc}
        sourceMimeType={cropMimeType}
        sourceFileName={cropFileName}
        aspectPresetId={aspectPresetId}
        onAspectPresetIdChange={setAspectPresetId}
        onOpenChange={setCropDialogOpen}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </div>
  );
}
