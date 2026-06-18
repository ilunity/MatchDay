import { notFound, redirect } from "next/navigation";
import { FeatureFlagsForm } from "@/components/admin/feature-flags-form";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getAllFlagsWithMeta } from "@/lib/feature-flags";
import { ru } from "@/lib/i18n/ru";

export default async function AdminFlagsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/flags");
  }

  if (!isAdminEmail(session.user.email)) {
    notFound();
  }

  const flags = await getAllFlagsWithMeta();

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{ru.adminFlagsTitle}</h1>
        <p className="text-muted-foreground">{ru.adminFlagsDescription}</p>
      </div>
      <FeatureFlagsForm
        flags={flags.map((flag) => ({
          key: flag.key,
          enabled: flag.enabled,
          updatedAt: flag.updatedAt?.toISOString() ?? null,
          updatedBy: flag.updatedBy,
        }))}
      />
    </div>
  );
}
