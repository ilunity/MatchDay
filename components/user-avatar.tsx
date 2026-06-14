"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { buildMarbleAvatarDataUrl } from "@/lib/marble-avatar";

type UserAvatarProps = {
  userId: string;
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
};

export function UserAvatar({
  userId,
  name,
  avatarUrl,
  size = 32,
  className,
}: UserAvatarProps) {
  const marbleUrl = buildMarbleAvatarDataUrl(userId, 80);
  const alt = name?.trim() || "Аватар";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <Image
          src={marbleUrl}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
      )}
    </span>
  );
}
