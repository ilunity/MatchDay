import mongoose, { Schema, models, model } from "mongoose";

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  coverImageKey?: string;
  ownerId: mongoose.Types.ObjectId;
  possibleDates: Date[];
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
    requireAuth: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "events" }
);

export const Event = models.Event || model<IEvent>("Event", EventSchema);
