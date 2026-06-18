import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyEmailToken } from "@/actions/auth";
import { auth } from "@/lib/auth";
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
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const session = await auth();

  if (!token) {
    return (
      <VerifyEmailResult
        success={false}
        message={ru.emailVerificationInvalid}
      />
    );
  }

  const result = await verifyEmailToken(token);

  if (result.success && session?.user?.id) {
    redirect("/profile?emailVerified=1");
  }

  return (
    <VerifyEmailResult
      success={result.success}
      message={
        result.success
          ? ru.emailVerifiedSuccess
          : (result.error ?? ru.emailVerificationInvalid)
      }
    />
  );
}

function VerifyEmailResult({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {success ? ru.emailVerifiedSuccess : ru.authErrorTitle}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/profile">{ru.profile}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
