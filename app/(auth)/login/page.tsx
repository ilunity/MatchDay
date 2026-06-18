import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { getPasswordAuthFlags } from "@/actions/auth";
import { ru } from "@/lib/i18n/ru";

export default async function LoginPage() {
  const { passwordLogin, passwordRegistration } = await getPasswordAuthFlags();

  return (
    <Suspense
      fallback={
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          {ru.loading}
        </div>
      }
    >
      <LoginForm
        passwordLoginEnabled={passwordLogin}
        passwordRegistrationEnabled={passwordRegistration}
      />
    </Suspense>
  );
}
