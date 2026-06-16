function env(name: string): string | undefined {
  return process.env[name];
}

export function getAppUrl(): string {
  return (env("APP_URL") ?? env("NEXTAUTH_URL") ?? "http://localhost:3000").replace(/\/$/, "");
}

export function buildMagicLinkVerifyUrl(callbackUrl: string): string {
  return `${getAppUrl()}/login/verify#${encodeURIComponent(callbackUrl)}`;
}
