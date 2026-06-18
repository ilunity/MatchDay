import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email?: string;
  username?: string;
  passwordHash?: string;
  name?: string;
  avatarKey?: string;
  emailVerified?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true },
    username: { type: String, unique: true, sparse: true, lowercase: true },
    passwordHash: { type: String },
    name: { type: String },
    avatarKey: { type: String },
    emailVerified: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

export const User = models.User || model<IUser>("User", UserSchema);

export function userHasPassword(user: Pick<IUser, "passwordHash">): boolean {
  return !!user.passwordHash;
}

export function userHasVerifiedEmail(
  user: Pick<IUser, "email" | "emailVerified">
): boolean {
  return !!user.email && !!user.emailVerified;
}
