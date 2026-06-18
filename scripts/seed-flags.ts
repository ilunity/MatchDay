import { connectDB } from "../lib/db";
import {
  FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
} from "../lib/feature-flags.registry";
import { FeatureFlag } from "../models/FeatureFlag";

async function seedFlags(): Promise<void> {
  await connectDB();

  const existing = await FeatureFlag.find().lean<Array<{ key: string }>>();
  const existingKeys = new Set(existing.map((doc) => doc.key));
  const missingKeys = FEATURE_FLAG_KEYS.filter((key) => !existingKeys.has(key));

  if (missingKeys.length === 0) {
    console.log(`All ${FEATURE_FLAG_KEYS.length} feature flags are present.`);
    return;
  }

  await FeatureFlag.insertMany(
    missingKeys.map((key) => ({
      key,
      enabled: FEATURE_FLAGS[key].defaultEnabled,
      updatedAt: new Date(),
    }))
  );

  console.log(`Seeded ${missingKeys.length} missing feature flags.`);
}

seedFlags()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
