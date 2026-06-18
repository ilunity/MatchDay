import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { isEnabled } from "@/lib/feature-flags";
import { ru } from "@/lib/i18n/ru";

export default async function RegisterPage() {
  const passwordRegistration = await isEnabled("passwordRegistration");

  if (!passwordRegistration) {
    redirect("/login");
  }

  return (
    <Suspense
      fallback={
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          {ru.loading}
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
