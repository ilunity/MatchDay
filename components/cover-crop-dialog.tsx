"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImageFile } from "@/lib/crop-image";
import {
  COVER_ASPECT_PRESETS,
  MAX_COVER_SIZE,
  type CoverAspectPresetId,
  validateImageFile,
} from "@/lib/image-constants";
import { ru } from "@/lib/i18n/ru";
import { cn } from "@/lib/utils";

type CoverCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  sourceFileName?: string;
  sourceMimeType?: string;
  aspectPresetId: CoverAspectPresetId;
  onAspectPresetIdChange: (id: CoverAspectPresetId) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File, previewUrl: string) => void;
  onCancel?: () => void;
};

function outputMimeType(sourceMimeType: string): string {
  if (sourceMimeType === "image/png") return "image/png";
  if (sourceMimeType === "image/webp") return "image/webp";
  return "image/jpeg";
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function CoverCropDialog({
  open,
  imageSrc,
  sourceFileName = "cover.jpg",
  sourceMimeType = "image/jpeg",
  aspectPresetId,
  onAspectPresetIdChange,
  onOpenChange,
  onConfirm,
  onCancel,
}: CoverCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspectRatio =
    COVER_ASPECT_PRESETS.find((preset) => preset.id === aspectPresetId)?.ratio ??
    COVER_ASPECT_PRESETS[0].ratio;

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError(null);
    }
  }, [open, imageSrc]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [aspectPresetId]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onCancel?.();
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return;

    setPending(true);
    setError(null);

    try {
      const mimeType = outputMimeType(sourceMimeType);
      const ext = extensionForMimeType(mimeType);
      const baseName = sourceFileName.replace(/\.[^.]+$/, "") || "cover";
      const file = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        `${baseName}.${ext}`,
        mimeType
      );

      const validationError = validateImageFile(file, MAX_COVER_SIZE);
      if (validationError === "too_large") {
        setError(ru.coverTooLarge);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      onConfirm(file, previewUrl);
      onOpenChange(false);
    } catch {
      setError(ru.errorGeneric);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden p-0",
          "inset-0 h-[100dvh] translate-x-0 translate-y-0 rounded-none border-0",
          "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90dvh] sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 px-4 pt-4 pr-12 sm:px-6 sm:pt-6 sm:pr-12">
          <DialogTitle>{ru.coverCropTitle}</DialogTitle>
          <DialogDescription>{ru.coverCropHint}</DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-2 px-4 pt-3 sm:px-6 sm:pt-4">
          <p className="text-sm text-muted-foreground">{ru.coverCropAspect}</p>
          <div
            className={cn(
              "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "sm:flex-wrap sm:overflow-visible"
            )}
          >
            {COVER_ASPECT_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                className="shrink-0"
                variant={preset.id === aspectPresetId ? "default" : "outline"}
                onClick={() => onAspectPresetIdChange(preset.id)}
                disabled={pending}
                aria-pressed={preset.id === aspectPresetId}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "relative mt-3 min-h-0 w-full flex-1 bg-muted",
            "sm:mt-4 sm:h-72 sm:flex-none"
          )}
        >
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="shrink-0 space-y-2 px-4 py-3 sm:px-6 sm:py-4">
          <label className="text-sm text-muted-foreground" htmlFor="cover-crop-zoom">
            {ru.coverCropZoom}
          </label>
          <input
            id="cover-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {error ? (
          <p className="shrink-0 px-4 text-sm text-destructive sm:px-6">{error}</p>
        ) : null}

        <div className="flex shrink-0 flex-col-reverse gap-2 px-4 pb-4 pt-2 sm:flex-row sm:justify-end sm:px-6 sm:pb-6 sm:pt-0">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            {ru.cancel}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleConfirm}
            disabled={pending || !croppedAreaPixels}
          >
            {pending ? ru.loading : ru.coverCropConfirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
