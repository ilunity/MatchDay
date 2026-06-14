import { connectDB } from "@/lib/db";
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
    event.possibleDates.map((d) => new Date(d).toISOString().slice(0, 10))
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
      date: new Date(r._id).toISOString().slice(0, 10),
      count: r.count,
    }))
    .filter((s: { date: string; count: number }) => possibleSet.has(s.date));

  const totalParticipants = await Availability.countDocuments({
    eventId: event._id,
  });

  return NextResponse.json({ stats, totalParticipants });
}
