import { CredentialsSignin } from "next-auth";

export const IP_LOGIN_LOCKED_PREFIX = "ip_login_locked:";
export const ACCOUNT_LOGIN_LOCKED_PREFIX = "account_login_locked:";

export type LoginLockoutType = "ip" | "account";

export type ParsedLoginLockout = {
  type: LoginLockoutType;
  lockedUntil: Date;
};

export class IpLoginLockedError extends CredentialsSignin {
  code: string;

  constructor(lockedUntil: Date) {
    super();
    this.code = `${IP_LOGIN_LOCKED_PREFIX}${lockedUntil.getTime()}`;
  }
}

export class AccountLoginLockedError extends CredentialsSignin {
  code: string;

  constructor(lockedUntil: Date) {
    super();
    this.code = `${ACCOUNT_LOGIN_LOCKED_PREFIX}${lockedUntil.getTime()}`;
  }
}

export function parseLoginLockoutCode(
  code?: string | null
): ParsedLoginLockout | null {
  if (!code) {
    return null;
  }

  if (code.startsWith(IP_LOGIN_LOCKED_PREFIX)) {
    const timestamp = Number(code.slice(IP_LOGIN_LOCKED_PREFIX.length));
    if (!Number.isFinite(timestamp)) {
      return null;
    }
    return { type: "ip", lockedUntil: new Date(timestamp) };
  }

  if (code.startsWith(ACCOUNT_LOGIN_LOCKED_PREFIX)) {
    const timestamp = Number(code.slice(ACCOUNT_LOGIN_LOCKED_PREFIX.length));
    if (!Number.isFinite(timestamp)) {
      return null;
    }
    return { type: "account", lockedUntil: new Date(timestamp) };
  }

  return null;
}

export function getActiveLockout(
  ipLockedUntil: string | null,
  accountLockedUntil: string | null
): ParsedLoginLockout | null {
  const now = Date.now();
  const ipUntil = ipLockedUntil ? new Date(ipLockedUntil).getTime() : 0;
  const accountUntil = accountLockedUntil
    ? new Date(accountLockedUntil).getTime()
    : 0;

  if (ipUntil > now) {
    return { type: "ip", lockedUntil: new Date(ipUntil) };
  }

  if (accountUntil > now) {
    return { type: "account", lockedUntil: new Date(accountUntil) };
  }

  return null;
}
