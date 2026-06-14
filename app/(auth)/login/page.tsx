import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { ru } from "@/lib/i18n/ru";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          {ru.loading}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
