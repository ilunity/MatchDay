import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import {
  LoginLockout,
  type LoginLockoutScope,
} from "@/models/LoginLockout";

export const IP_MAX_ATTEMPTS = 10;
export const ACCOUNT_MAX_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

export type LoginLockStatus = {
  locked: boolean;
  lockedUntil: Date | null;
  consecutiveFailures: number;
};

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return headersList.get("x-real-ip") ?? "unknown";
}

async function getLockoutRecord(
  scope: LoginLockoutScope,
  key: string
): Promise<LoginLockStatus> {
  await connectDB();

  const record = await LoginLockout.findOne({ scope, key }).lean<{
    consecutiveFailures: number;
    lockedUntil: Date | null;
  }>();

  if (!record) {
    return { locked: false, lockedUntil: null, consecutiveFailures: 0 };
  }

  const now = new Date();
  if (record.lockedUntil && record.lockedUntil <= now) {
    await LoginLockout.updateOne(
      { scope, key },
      {
        $set: {
          consecutiveFailures: 0,
          lockedUntil: null,
          updatedAt: now,
        },
      }
    );
    return { locked: false, lockedUntil: null, consecutiveFailures: 0 };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      locked: true,
      lockedUntil: record.lockedUntil,
      consecutiveFailures: record.consecutiveFailures,
    };
  }

  return {
    locked: false,
    lockedUntil: null,
    consecutiveFailures: record.consecutiveFailures,
  };
}

export async function checkIpLock(ip: string): Promise<LoginLockStatus> {
  return getLockoutRecord("ip", ip);
}

export async function checkAccountLock(
  username: string
): Promise<LoginLockStatus> {
  return getLockoutRecord("account", username.toLowerCase());
}

async function recordFailure(
  scope: LoginLockoutScope,
  key: string,
  maxAttempts: number
): Promise<LoginLockStatus> {
  await connectDB();

  const now = new Date();
  const record = await LoginLockout.findOneAndUpdate(
    { scope, key },
    {
      $inc: { consecutiveFailures: 1 },
      $set: { updatedAt: now },
    },
    { upsert: true, new: true }
  ).lean<{ consecutiveFailures: number; lockedUntil: Date | null }>();

  if (!record) {
    return { locked: false, lockedUntil: null, consecutiveFailures: 0 };
  }

  if (record.consecutiveFailures >= maxAttempts) {
    const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS);
    await LoginLockout.updateOne(
      { scope, key },
      { $set: { lockedUntil, updatedAt: now } }
    );
    return {
      locked: true,
      lockedUntil,
      consecutiveFailures: record.consecutiveFailures,
    };
  }

  return {
    locked: false,
    lockedUntil: null,
    consecutiveFailures: record.consecutiveFailures,
  };
}

export async function recordIpFailure(ip: string): Promise<LoginLockStatus> {
  return recordFailure("ip", ip, IP_MAX_ATTEMPTS);
}

export async function recordAccountFailure(
  username: string
): Promise<LoginLockStatus> {
  return recordFailure("account", username.toLowerCase(), ACCOUNT_MAX_ATTEMPTS);
}

export async function clearLoginFailures(
  ip: string,
  username?: string
): Promise<void> {
  await connectDB();

  const keys: Array<{ scope: LoginLockoutScope; key: string }> = [
    { scope: "ip", key: ip },
  ];

  if (username) {
    keys.push({ scope: "account", key: username.toLowerCase() });
  }

  await LoginLockout.deleteMany({
    $or: keys.map(({ scope, key }) => ({ scope, key })),
  });
}

export async function getPasswordLoginLockStatus(
  username?: string
): Promise<{
  ipLockedUntil: string | null;
  accountLockedUntil: string | null;
}> {
  const ip = await getClientIp();
  const ipStatus = await checkIpLock(ip);

  let accountLockedUntil: string | null = null;
  if (username) {
    const accountStatus = await checkAccountLock(username);
    if (accountStatus.locked && accountStatus.lockedUntil) {
      accountLockedUntil = accountStatus.lockedUntil.toISOString();
    }
  }

  return {
    ipLockedUntil:
      ipStatus.locked && ipStatus.lockedUntil
        ? ipStatus.lockedUntil.toISOString()
        : null,
    accountLockedUntil,
  };
}
