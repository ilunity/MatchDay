import { createTransport, type Transporter } from "nodemailer";
import { ru } from "@/lib/i18n/ru";

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
  console.log("MatchDay — ссылка для входа (SMTP_CONSOLE=true)");
  console.log(`Кому:   ${to}`);
  console.log(`От:     ${from}`);
  console.log(`Ссылка: ${url}`);
  console.log(`${line}\n`);
}

function getSmtpTransport(): Transporter {
  return createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendMagicLinkEmail({
  to,
  url,
  from,
}: {
  to: string;
  url: string;
  from: string;
}): Promise<void> {
  const transport = getSmtpTransport();
  const text = ru.magicLinkEmailText(url);

  await transport.sendMail({
    to,
    from,
    subject: ru.magicLinkEmailSubject,
    text,
    html: `<p>Перейдите по ссылке, чтобы войти в MatchDay:</p><p><a href="${url}">${url}</a></p><p>Ссылка действует ограниченное время.</p>`,
  });
}
