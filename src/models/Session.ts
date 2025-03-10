import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISession extends Document {
  _id: Types.ObjectId;
  name: string;
  therapistId: string;
  clientId: string;
  status: string;
  type: string;
  sessionDateTime: string;
  duration: string;
  location: string;
  isNewClient: boolean;
  isPaid: boolean;
  createdAt: string;
  rescheduledAt: string;
  rescheduledBy: string;
  rescheduledReason: string;
  rescheduledStatus: string;
  isPackageCreated: Boolean;
  organizationId: string;
  packageId: string;
  createdBy: string;
}

const SessionSchema = new Schema<ISession>({
  name: { type: String, required: true },
  therapistId: { type: String, required: true },
  clientId: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "rescheduled"],
  },
  type: {
    type: String,
    required: true,
    enum: [
      "call",
      "individual-session",
      "couple",
      "organization",
      "event",
      "package",
      "online-meeting",
      "offline",
      "online",
    ],
  },
  sessionDateTime: { type: String, required: true },
  duration: { type: String, required: true },
  location: { type: String, required: true },
  isNewClient: { type: Boolean, required: true },
  isPaid: { type: Boolean, required: true },
  createdAt: { type: String, required: true },
  rescheduledAt: { type: String, required: false },
  rescheduledBy: { type: String, required: false },
  rescheduledReason: { type: String, required: false },
  rescheduledStatus: {
    type: String,
    required: false,
    enum: ["pending", "approved", "rejected"],
  },
  isPackageCreated: { type: Boolean, required: false },
  organizationId: { type: String, required: false },
  packageId: { type: String, required: false },
  createdBy: { type: String, required: true },
});

const Session = mongoose.model<ISession>("Session", SessionSchema);
export default Session;
