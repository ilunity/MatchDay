"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestEmailLink, setUserPassword } from "@/actions/auth";
import { isAllowedAuthEmail } from "@/lib/allowed-email-domains";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ru } from "@/lib/i18n/ru";
import { toast } from "sonner";

type ProfileAuthSectionProps = {
  hasPassword: boolean;
  hasVerifiedEmail: boolean;
  username?: string | null;
  email?: string | null;
  passwordRegistrationEnabled: boolean;
};

export function ProfileAuthSection({
  hasPassword,
  hasVerifiedEmail,
  username,
  email,
  passwordRegistrationEnabled,
}: ProfileAuthSectionProps) {
  const router = useRouter();
  const [linkEmailValue, setLinkEmailValue] = useState(email ?? "");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [linkPending, startLinkTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  const showLinkEmail = hasPassword && !hasVerifiedEmail;
  const showSetPassword =
    passwordRegistrationEnabled && hasVerifiedEmail && !hasPassword;

  if (!showLinkEmail && !showSetPassword && !hasPassword && !hasVerifiedEmail) {
    return null;
  }

  function handleLinkEmail(e: React.FormEvent) {
    e.preventDefault();
    setLinkError(null);

    if (!isAllowedAuthEmail(linkEmailValue)) {
      setLinkError(ru.foreignEmailNotAllowed);
      return;
    }

    const formData = new FormData();
    formData.set("email", linkEmailValue);

    startLinkTransition(async () => {
      const result = await requestEmailLink(formData);
      if (!result.success) {
        setLinkError(result.error ?? ru.errorGeneric);
        return;
      }
      toast.success(ru.linkEmailSent);
    });
  }

  function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    const formData = new FormData();
    formData.set("username", newUsername);
    formData.set("password", newPassword);
    formData.set("confirmPassword", confirmPassword);

    startPasswordTransition(async () => {
      const result = await setUserPassword(formData);
      if (!result.success) {
        setPasswordError(result.error ?? ru.errorGeneric);
        return;
      }
      toast.success(ru.passwordSetSuccess);
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold">{ru.authMethodsTitle}</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {hasVerifiedEmail && email && (
              <li>
                {ru.hasVerifiedEmail}: {email}
              </li>
            )}
            {hasPassword && username && (
              <li>
                {ru.hasPassword}: {username}
              </li>
            )}
          </ul>
        </div>

      {showLinkEmail && (
        <form onSubmit={handleLinkEmail} className="space-y-4">
          <div>
            <h3 className="font-medium">{ru.linkEmail}</h3>
            <p className="text-sm text-muted-foreground">{ru.linkEmailHint}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkEmail">{ru.email}</Label>
            <Input
              id="linkEmail"
              type="email"
              value={linkEmailValue}
              onChange={(e) => setLinkEmailValue(e.target.value)}
              required
              autoComplete="email"
              placeholder={ru.emailPlaceholder}
            />
            <p className="text-sm text-muted-foreground">{ru.emailHint}</p>
          </div>
          {linkError && <p className="text-sm text-destructive">{linkError}</p>}
          <Button type="submit" disabled={linkPending} variant="outline">
            {linkPending ? ru.loading : ru.linkEmail}
          </Button>
        </form>
      )}

      {showSetPassword && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <h3 className="font-medium">{ru.setPassword}</h3>
            <p className="text-sm text-muted-foreground">{ru.setPasswordHint}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setUsername">{ru.username}</Label>
            <Input
              id="setUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder={ru.usernamePlaceholder}
            />
            <p className="text-sm text-muted-foreground">{ru.usernameHint}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setPassword">{ru.password}</Label>
            <Input
              id="setPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder={ru.passwordPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setConfirmPassword">{ru.confirmPassword}</Label>
            <Input
              id="setConfirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder={ru.passwordPlaceholder}
            />
          </div>
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          <Button type="submit" disabled={passwordPending} variant="outline">
            {passwordPending ? ru.loading : ru.setPassword}
          </Button>
        </form>
      )}
      </CardContent>
    </Card>
  );
}
