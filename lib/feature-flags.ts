import { connectDB } from "@/lib/db";
import {
  FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  type FeatureFlagKey,
} from "@/lib/feature-flags.registry";
import { FeatureFlag } from "@/models/FeatureFlag";

const CACHE_TTL_MS = 30_000;

type FlagCache = {
  flags: Map<FeatureFlagKey, boolean>;
  fetchedAt: number;
};

let cache: FlagCache | null = null;
let seedPromise: Promise<void> | null = null;

export function invalidateFeatureFlagCache(): void {
  cache = null;
}

function defaultFlagsMap(): Map<FeatureFlagKey, boolean> {
  return new Map(
    FEATURE_FLAG_KEYS.map((key) => [key, FEATURE_FLAGS[key].defaultEnabled])
  );
}

async function seedDefaultsIfEmpty(): Promise<void> {
  if (seedPromise) {
    await seedPromise;
    return;
  }

  seedPromise = (async () => {
    await connectDB();
    const count = await FeatureFlag.countDocuments();
    if (count > 0) {
      return;
    }

    await FeatureFlag.insertMany(
      FEATURE_FLAG_KEYS.map((key) => ({
        key,
        enabled: FEATURE_FLAGS[key].defaultEnabled,
        updatedAt: new Date(),
      }))
    );
  })();

  try {
    await seedPromise;
  } catch (error) {
    seedPromise = null;
    throw error;
  }
}

async function loadFlagsFromDb(): Promise<Map<FeatureFlagKey, boolean>> {
  await connectDB();
  await seedDefaultsIfEmpty();

  const docs = await FeatureFlag.find().lean<
    Array<{ key: string; enabled: boolean }>
  >();

  const flags = defaultFlagsMap();
  for (const doc of docs) {
    if (doc.key in FEATURE_FLAGS) {
      flags.set(doc.key as FeatureFlagKey, doc.enabled);
    }
  }

  return flags;
}

export async function getFlags(): Promise<Map<FeatureFlagKey, boolean>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.flags;
  }

  const flags = await loadFlagsFromDb();
  cache = { flags, fetchedAt: Date.now() };
  return flags;
}

export async function isEnabled(key: FeatureFlagKey): Promise<boolean> {
  const flags = await getFlags();
  return flags.get(key) ?? FEATURE_FLAGS[key].defaultEnabled;
}

export type FeatureFlagWithMeta = {
  key: FeatureFlagKey;
  enabled: boolean;
  updatedAt: Date | null;
  updatedBy: string | null;
};

export async function getAllFlagsWithMeta(): Promise<FeatureFlagWithMeta[]> {
  await connectDB();
  await seedDefaultsIfEmpty();

  const docs = await FeatureFlag.find().lean<
    Array<{
      key: string;
      enabled: boolean;
      updatedAt?: Date;
      updatedBy?: string;
    }>
  >();

  return FEATURE_FLAG_KEYS.map((key) => {
    const doc = docs.find((item) => item.key === key);
    return {
      key,
      enabled: doc?.enabled ?? FEATURE_FLAGS[key].defaultEnabled,
      updatedAt: doc?.updatedAt ?? null,
      updatedBy: doc?.updatedBy ?? null,
    };
  });
}

export async function setFeatureFlagEnabled(
  key: FeatureFlagKey,
  enabled: boolean,
  updatedBy?: string
): Promise<void> {
  await connectDB();
  await seedDefaultsIfEmpty();

  await FeatureFlag.findOneAndUpdate(
    { key },
    {
      $set: {
        enabled,
        updatedAt: new Date(),
        ...(updatedBy ? { updatedBy } : {}),
      },
      $setOnInsert: { key },
    },
    { upsert: true, new: true }
  );

  invalidateFeatureFlagCache();
}
