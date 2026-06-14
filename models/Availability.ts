import mongoose, { Schema, models, model } from "mongoose";

export interface IAvailability {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  guestName?: string;
  availableDates: Date[];
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String },
    guestName: { type: String },
    availableDates: { type: [Date], default: [] },
  },
  { timestamps: true, collection: "availabilities" }
);

AvailabilitySchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

AvailabilitySchema.index(
  { eventId: 1, guestId: 1 },
  { unique: true, partialFilterExpression: { guestId: { $exists: true } } }
);

export const Availability =
  models.Availability ||
  model<IAvailability>("Availability", AvailabilitySchema);
