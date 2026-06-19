import { connectDB } from "../lib/db";
import { User } from "../models/User";

async function migrateUserIndexes(): Promise<void> {
  await connectDB();

  const unsetEmail = await User.updateMany(
    { email: null },
    { $unset: { email: "" } }
  );
  const unsetUsername = await User.updateMany(
    { username: null },
    { $unset: { username: "" } }
  );

  console.log(
    `Unset null email on ${unsetEmail.modifiedCount} user(s), null username on ${unsetUsername.modifiedCount} user(s).`
  );

  await User.syncIndexes();
  console.log("User indexes synced (email and username are sparse unique).");
}

migrateUserIndexes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
