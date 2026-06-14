import { connectDB } from "@/lib/db";
import { dateKey } from "@/lib/dates";
import { Event, type IEvent } from "@/models/Event";
import { Availability } from "@/models/Availability";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  await connectDB();

  const event = await Event.findOne({ slug }).lean<IEvent>();
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const possibleSet = new Set(
    event.possibleDates.map((d) => dateKey(new Date(d)))
  );

  const pipeline = [
    { $match: { eventId: event._id } },
    { $unwind: "$availableDates" },
    {
      $group: {
        _id: "$availableDates",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 as const, _id: 1 as const } },
  ];

  const results = await Availability.aggregate(pipeline);

  const stats = results
    .map((r: { _id: Date; count: number }) => ({
      date: dateKey(new Date(r._id)),
      count: r.count,
    }))
    .filter((s: { date: string; count: number }) => possibleSet.has(s.date));

  const totalParticipants = await Availability.countDocuments({
    eventId: event._id,
  });

  return NextResponse.json({ stats, totalParticipants });
}
