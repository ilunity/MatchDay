import mongoose, { Schema, models, model } from "mongoose";
import type { ConfirmationMode } from "@/lib/validations/confirmation";

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  coverImageKey?: string;
  ownerId: mongoose.Types.ObjectId;
  possibleDates: Date[];
  confirmedDates: Date[];
  confirmationMode: ConfirmationMode | null;
  confirmedAt?: Date;
  requireAuth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    coverImageKey: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    possibleDates: { type: [Date], default: [] },
    confirmedDates: { type: [Date], default: [] },
    confirmationMode: {
      type: String,
      enum: ["all", "one_of"],
      required: false,
      default: null,
    },
    confirmedAt: { type: Date },
    requireAuth: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "events" }
);

if (process.env.NODE_ENV !== "production" && models.Event) {
  delete models.Event;
}

export const Event = models.Event || model<IEvent>("Event", EventSchema);
