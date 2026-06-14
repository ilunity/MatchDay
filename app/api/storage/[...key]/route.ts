import { getObject } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ key: string[] }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { key: keyParts } = await params;
  const key = decodeURIComponent(keyParts.join("/"));

  try {
    const response = await getObject(key);
    const body = response.Body;

    if (!body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bytes = await body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": response.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
