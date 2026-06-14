import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function getEndpoint() {
  const host = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  const useSsl = process.env.MINIO_USE_SSL === "true";
  return `${useSsl ? "https" : "http"}://${host}:${port}`;
}

export function getS3Client() {
  return new S3Client({
    endpoint: getEndpoint(),
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? "",
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? "",
    },
    forcePathStyle: true,
  });
}

export function getBucket() {
  return process.env.MINIO_BUCKET ?? "matchday-covers";
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
) {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getObject(key: string) {
  const client = getS3Client();
  return client.send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

export async function deleteObject(key: string) {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

export function getPublicStorageUrl(key: string) {
  const base = process.env.MINIO_PUBLIC_URL ?? "/api/storage";
  return `${base}/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_COVER_SIZE = 5 * 1024 * 1024;
