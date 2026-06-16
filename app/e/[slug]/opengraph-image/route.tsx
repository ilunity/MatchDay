import { getEventBySlug } from "@/actions/events";
import { renderEventOgImage } from "@/lib/og-event-image";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  return renderEventOgImage(event);
}
