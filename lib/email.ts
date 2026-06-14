export function isConsoleEmail(): boolean {
  return process.env.SMTP_CONSOLE === "true";
}

export function logMagicLinkToConsole({
  to,
  url,
  from,
}: {
  to: string;
  url: string;
  from: string;
}): void {
  const line = "=".repeat(60);
  console.log(`\n${line}`);
  console.log("MatchDay magic link (SMTP_CONSOLE=true)");
  console.log(`To:   ${to}`);
  console.log(`From: ${from}`);
  console.log(`Link: ${url}`);
  console.log(`${line}\n`);
}
