export function getAppUrl(): string {
  return (process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function buildMagicLinkVerifyUrl(callbackUrl: string): string {
  return `${getAppUrl()}/login/verify#${encodeURIComponent(callbackUrl)}`;
}
