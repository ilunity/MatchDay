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
import { COVER_ASPECT, getCroppedImageFile } from "@/lib/crop-image";
import { MAX_COVER_SIZE, validateImageFile } from "@/lib/image-constants";
import { ru } from "@/lib/i18n/ru";

type CoverCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  sourceFileName?: string;
  sourceMimeType?: string;
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
  onOpenChange,
  onConfirm,
  onCancel,
}: CoverCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError(null);
    }
  }, [open, imageSrc]);

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
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="space-y-1 px-6 pt-6">
          <DialogTitle>{ru.coverCropTitle}</DialogTitle>
          <DialogDescription>{ru.coverCropHint}</DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 h-64 w-full bg-muted sm:h-72">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={COVER_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="space-y-2 px-6 py-4">
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

        {error ? <p className="px-6 text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            {ru.cancel}
          </Button>
          <Button
            type="button"
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
