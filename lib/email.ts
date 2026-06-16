import { createTransport, type Transporter } from "nodemailer";
import { ru } from "@/lib/i18n/ru";

function env(name: string): string | undefined {
  return process.env[name];
}

export function isConsoleEmail(): boolean {
  return env("SMTP_CONSOLE") === "true";
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

export function getSmtpServerConfig() {
  const port = Number(env("SMTP_PORT") ?? 587);
  return {
    host: env("SMTP_HOST"),
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: env("SMTP_USER"),
      pass: env("SMTP_PASSWORD"),
    },
  };
}

function getSmtpTransport(): Transporter {
  return createTransport(getSmtpServerConfig());
}

function buildMagicLinkEmailHtml(url: string): string {
  const buttonGradient =
    "linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #60a5fa 100%)";
  const pageGradient =
    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.14), transparent), radial-gradient(ellipse 72% 58% at 100% 0%, rgba(37, 99, 235, 0.22), transparent 72%), #fafafa";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${ru.magicLinkEmailSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${pageGradient};background-color:#fafafa;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
          <tr>
            <td align="center" style="padding:32px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0a0a0a;text-align:center;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;line-height:1.3;">${ru.appName}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#71717a;">${ru.magicLinkEmailIntro}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius:8px;background-color:#2563eb;background-image:${buttonGradient};">
                          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;line-height:1.2;color:#fafafa;text-decoration:none;border-radius:8px;">${ru.magicLinkEmailButton}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#71717a;">${ru.magicLinkEmailExpire}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

  try {
    await transport.sendMail({
      to,
      from,
      subject: ru.magicLinkEmailSubject,
      text,
      html: buildMagicLinkEmailHtml(url),
    });
  } catch (error) {
    console.error("SMTP send failed:", error);
    throw error;
  }
}
