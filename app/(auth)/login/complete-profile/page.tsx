import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CompleteProfilePageForm } from "@/components/complete-profile-page-form";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function CompleteProfilePage({ searchParams }: PageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl ?? "/dashboard")}`);
  }

  if (session.user.name?.trim()) {
    redirect(callbackUrl ?? "/dashboard");
  }

  return (
    <CompleteProfilePageForm
      callbackUrl={callbackUrl ?? "/dashboard"}
    />
  );
}
