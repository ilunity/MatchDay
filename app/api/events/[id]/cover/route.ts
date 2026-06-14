import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  ALLOWED_IMAGE_TYPES,
  deleteObject,
  MAX_COVER_SIZE,
  uploadObject,
} from "@/lib/minio";
import { Event } from "@/models/Event";
import { nanoid } from "nanoid";
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

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (file.size > MAX_COVER_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const key = `covers/${id}/${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (event.coverImageKey) {
    try {
      await deleteObject(event.coverImageKey);
    } catch {
      // ignore delete errors
    }
  }

  await uploadObject(key, buffer, file.type);
  event.coverImageKey = key;
  await event.save();

  return NextResponse.json({ key });
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

  if (event.coverImageKey) {
    try {
      await deleteObject(event.coverImageKey);
    } catch {
      // ignore
    }
    event.coverImageKey = undefined;
    await event.save();
  }

  return NextResponse.json({ success: true });
}
