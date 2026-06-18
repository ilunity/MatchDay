import mongoose, { Schema, models, model } from "mongoose";

export interface IFeatureFlag {
  _id: mongoose.Types.ObjectId;
  key: string;
  enabled: boolean;
  updatedAt: Date;
  updatedBy?: string;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String },
  },
  { collection: "feature_flags" }
);

export const FeatureFlag =
  models.FeatureFlag || model<IFeatureFlag>("FeatureFlag", FeatureFlagSchema);
