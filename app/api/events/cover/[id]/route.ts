import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { removeEventCover, saveEventCover } from "@/lib/cover";
import { Event } from "@/models/Event";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const event = await Event.findById(id);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (event.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("cover") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const error = await saveEventCover(event, file);
  if (error === "invalid_type") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (error === "too_large") {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  return NextResponse.json({ key: event.coverImageKey });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const event = await Event.findById(id);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (event.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await removeEventCover(event);

  return NextResponse.json({ success: true });
}
