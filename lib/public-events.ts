import { connectDB } from "@/lib/db";
import { Event, type IEvent } from "@/models/Event";

export type PublicEventSitemapEntry = Pick<IEvent, "slug" | "updatedAt">;

export async function getPublicEventsForSitemap(): Promise<
  PublicEventSitemapEntry[]
> {
  await connectDB();

  return Event.find({ requireAuth: false })
    .select("slug updatedAt")
    .sort({ updatedAt: -1 })
    .lean<PublicEventSitemapEntry[]>();
}
