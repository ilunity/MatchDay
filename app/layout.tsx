import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { defaultMetadata } from "@/lib/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden antialiased`}>
        <Providers>
          <Header />
          <main className="overflow-x-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
