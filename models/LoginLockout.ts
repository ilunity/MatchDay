import mongoose, { Schema, models, model } from "mongoose";

export type LoginLockoutScope = "ip" | "account";

export interface ILoginLockout {
  _id: mongoose.Types.ObjectId;
  scope: LoginLockoutScope;
  key: string;
  consecutiveFailures: number;
  lockedUntil: Date | null;
  updatedAt: Date;
}

const LoginLockoutSchema = new Schema<ILoginLockout>(
  {
    scope: { type: String, required: true, enum: ["ip", "account"] },
    key: { type: String, required: true },
    consecutiveFailures: { type: Number, required: true, default: 0 },
    lockedUntil: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "login_lockouts" }
);

LoginLockoutSchema.index({ scope: 1, key: 1 }, { unique: true });

export const LoginLockout =
  models.LoginLockout ||
  model<ILoginLockout>("LoginLockout", LoginLockoutSchema);
