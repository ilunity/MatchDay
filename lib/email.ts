import {
  createTransport,
  type SentMessageInfo,
  type Transporter,
} from "nodemailer";
import { ru } from "@/lib/i18n/ru";

function env(name: string): string | undefined {
  return process.env[name];
}

type SmtpLogLevel = "info" | "error";

export function isConsoleEmail(): boolean {
  return env("SMTP_CONSOLE") === "true";
}

export function isSmtpLogEnabled(): boolean {
  return env("SMTP_LOG") === "true";
}

export function isSmtpHtmlEnabled(): boolean {
  return env("SMTP_HTML") === "true";
}

function logSmtp(
  level: SmtpLogLevel,
  event: string,
  data: Record<string, unknown> = {}
): void {
  if (!isSmtpLogEnabled()) {
    return;
  }

  const payload = { event, ...data };
  if (level === "error") {
    console.error("[smtp]", payload);
    return;
  }
  console.log("[smtp]", payload);
}

export function logSmtpEvent(
  level: SmtpLogLevel,
  event: string,
  data: Record<string, unknown> = {}
): void {
  logSmtp(level, event, data);
}

export function getSmtpConfigSnapshot() {
  const config = getSmtpServerConfig();
  return {
    host: config.host ?? "(missing)",
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    user: config.auth.user ?? "(missing)",
    password: config.auth.pass ? "(set)" : "(missing)",
    from: env("SMTP_FROM") ?? "(missing)",
    consoleMode: isConsoleEmail(),
    htmlMode: isSmtpHtmlEnabled(),
  };
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

function logSendSuccess(
  context: { to: string; from: string; subject: string },
  result: SentMessageInfo,
  durationMs: number
): void {
  logSmtp("info", "send.success", {
    to: context.to,
    from: context.from,
    subject: context.subject,
    durationMs,
    messageId: result.messageId ?? null,
    response: result.response ?? null,
    accepted: result.accepted ?? [],
    rejected: result.rejected ?? [],
    envelope: result.envelope ?? null,
  });
}

function logSendError(
  error: unknown,
  context: { to: string; from: string; subject: string },
  durationMs: number
): void {
  const err = error as {
    code?: string;
    response?: string;
    responseCode?: number;
    command?: string;
  };

  logSmtp("error", "send.failed", {
    to: context.to,
    from: context.from,
    subject: context.subject,
    durationMs,
    config: getSmtpConfigSnapshot(),
    code: err.code ?? null,
    response: err.response ?? null,
    responseCode: err.responseCode ?? null,
    command: err.command ?? null,
    message: error instanceof Error ? error.message : String(error),
  });
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
                          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;line-height:1.2;color:#fafafa;text-decoration:none;border-radius:8px;">${ru.magicLinkEmailLinkTitle}</a>
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
  const subject = ru.magicLinkEmailSubject;
  const context = { to, from, subject };
  const startedAt = Date.now();
  const htmlEnabled = isSmtpHtmlEnabled();

  logSmtp("info", "send.start", {
    ...context,
    html: htmlEnabled,
    config: getSmtpConfigSnapshot(),
    verifyPath: "/login/verify",
  });

  const transport = getSmtpTransport();
  const text = ru.magicLinkEmailText(url);

  try {
    const result = await transport.sendMail({
      to,
      from,
      subject,
      text,
      ...(htmlEnabled ? { html: buildMagicLinkEmailHtml(url) } : {}),
    });
    logSendSuccess(context, result, Date.now() - startedAt);
  } catch (error) {
    logSendError(error, context, Date.now() - startedAt);
    throw error;
  }
}
