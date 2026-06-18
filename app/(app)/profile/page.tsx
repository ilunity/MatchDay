import { redirect } from "next/navigation";
import { ProfileAuthSection } from "@/components/profile-auth-section";
import { ProfileForm } from "@/components/profile-form";
import { auth } from "@/lib/auth";
import { avatarUrlFromKey } from "@/lib/avatar";
import { connectDB } from "@/lib/db";
import { isEnabled } from "@/lib/feature-flags";
import { ru } from "@/lib/i18n/ru";
import {
  User,
  userHasPassword,
  userHasVerifiedEmail,
  type IUser,
} from "@/models/User";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  await connectDB();
  const user = await User.findById(session.user.id)
    .select("email username passwordHash emailVerified name")
    .lean<
      Pick<IUser, "email" | "username" | "passwordHash" | "emailVerified" | "name">
    >();

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  const passwordRegistrationEnabled = await isEnabled("passwordRegistration");

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{ru.profile}</h1>
        <p className="text-muted-foreground">{ru.profileHint}</p>
      </div>
      <div className="space-y-6">
        <ProfileForm
          userId={session.user.id}
          initialName={session.user.name}
          initialAvatarUrl={avatarUrlFromKey(session.user.avatarKey)}
        />
        <ProfileAuthSection
          hasPassword={userHasPassword(user)}
          hasVerifiedEmail={userHasVerifiedEmail(user)}
          username={user.username}
          email={user.email}
          passwordRegistrationEnabled={passwordRegistrationEnabled}
        />
      </div>
    </div>
  );
}
