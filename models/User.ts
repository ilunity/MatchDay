import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  emailVerified?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String },
    emailVerified: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

export const User = models.User || model<IUser>("User", UserSchema);
