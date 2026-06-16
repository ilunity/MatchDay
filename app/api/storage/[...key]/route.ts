import { getObject } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ key: string[] }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { key: keyParts } = await params;
  const key = decodeURIComponent(keyParts.join("/"));

  if (!key.startsWith("covers/") && !key.startsWith("avatars/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const response = await getObject(key);
    const body = response.Body;

    if (!body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contentType = response.ContentType ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
