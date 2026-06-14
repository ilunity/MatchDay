import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { auth } from "@/lib/auth";
import { avatarUrlFromKey } from "@/lib/avatar";
import { ru } from "@/lib/i18n/ru";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{ru.profile}</h1>
        <p className="text-muted-foreground">{ru.profileHint}</p>
      </div>
      <ProfileForm
        userId={session.user.id}
        initialName={session.user.name}
        initialAvatarUrl={avatarUrlFromKey(session.user.avatarKey)}
      />
    </div>
  );
}
