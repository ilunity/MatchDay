import Link from "next/link";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{ error?: string; code?: string }>;
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error, code } = await searchParams;
  const message = getAuthErrorMessage(error, code);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{ru.authErrorTitle}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login" className="flex items-center justify-center">
              {ru.tryLoginAgain}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
