export const ALLOWED_EMAIL_PROVIDER_DOMAINS = [
  "yandex.ru",
  "ya.ru",
  "vk.com",
  "mail.ru",
  "inbox.ru",
  "bk.ru",
  "list.ru",
  "internet.ru",
  "rambler.ru",
  "ro.ru",
  "myrambler.ru",
] as const;

export const BLOCKED_FOREIGN_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
] as const;

export const FOREIGN_EMAIL_ERROR_CODE = "foreign_email_not_allowed";

const RU_TLD_SUFFIXES = [".ru", ".рф", ".xn--p1ai"] as const;

const providerDomainSet = new Set<string>(ALLOWED_EMAIL_PROVIDER_DOMAINS);
const blockedDomainSet = new Set<string>(BLOCKED_FOREIGN_EMAIL_DOMAINS);

export function getEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) {
    return null;
  }
  return normalized.slice(at + 1);
}

export function hasAllowedTld(domain: string): boolean {
  const lower = domain.toLowerCase();
  return RU_TLD_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

function getExtraAllowedDomains(): Set<string> {
  const raw = process.env["ALLOWED_EMAIL_DOMAINS"];
  if (!raw?.trim()) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAllowedAuthEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) {
    return false;
  }

  if (blockedDomainSet.has(domain)) {
    return false;
  }

  if (hasAllowedTld(domain)) {
    return true;
  }

  if (providerDomainSet.has(domain)) {
    return true;
  }

  if (getExtraAllowedDomains().has(domain)) {
    return true;
  }

  return false;
}
