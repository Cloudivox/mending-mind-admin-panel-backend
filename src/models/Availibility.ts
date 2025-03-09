import mongoose, { Document, Schema } from "mongoose";

export interface IAvailibility extends Document {
  userId: mongoose.Types.ObjectId; // Change userId type
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  rescheduledStatus: string;
  clientId: string;
  organizationId: string;
}

const AvailibilitySchema = new Schema<IAvailibility>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { type: String, required: true },
  organizationId: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["booked", "available"],
  },
  clientId: { type: String, required: false },
  rescheduledStatus: {
    type: String,
    default: "none",
    enum: ["none", "pending", "approved", "rejected"],
  },
});

export default mongoose.model("Availibility", AvailibilitySchema);
