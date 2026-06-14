import type { ReactNode } from "react";
import Image from "next/image";
import { ru } from "@/lib/i18n/ru";
import { linkifyText } from "@/lib/linkify";

type EventHeaderProps = {
  title: string;
  description?: string;
  coverUrl?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function EventHeader({
  title,
  description,
  coverUrl,
  actions,
  meta,
}: EventHeaderProps) {
  const hasBody = Boolean(coverUrl || description);

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {actions}
      </div>

      {meta}

      {hasBody && (
        <div className="md:clearfix">
          {coverUrl && (
            <div className="mb-5 w-full md:float-left md:mb-5 md:mr-5 md:w-[60%]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={coverUrl}
                  alt={ru.cover}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              </div>
            </div>
          )}
          {description && (
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
              {linkifyText(description)}
            </p>
          )}
          <div className="clear-both" />
        </div>
      )}
    </header>
  );
}
