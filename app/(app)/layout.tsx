import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = privatePageMetadata;

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
