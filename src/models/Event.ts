import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  location: string;
  eventType: string;
  date: string;
  time: string;
  duration: string;
  createdBy: string;
  createdAt: string;
  participants: string[];
  status: string;
  isPaid: boolean;
  price?: number;
  capacity?: number;
  host: string;
  hostDescription?: string;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    eventType: {
      type: String,
      required: true,
      enum: [
        "workshop",
        "seminar",
        "webinar",
        "support-group",
        "therapy-session",
        "conference",
        "community-meeting",
        "networking-event",
        "organization",
      ],
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: false },
    createdBy: { type: String, required: true },
    createdAt: { type: String, default: new Date().toISOString() },
    participants: { type: [String], default: [] }, // Array of user IDs
    status: {
      type: String,
      required: true,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isPaid: { type: Boolean, required: true },
    price: {
      type: Number,
      required: function () {
        return this.isPaid;
      },
    }, // Only required if event is paid
    capacity: { type: Number, required: false }, // Optional: Max number of participants
    host: { type: String, required: true },
    hostDescription: { type: String, required: false },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id; // Assign _id to id
        delete ret._id; // Remove _id
        delete ret.__v; // Remove __v (versioning field)
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model<IEvent>("Event", EventSchema);
