import mongoose, { Document, Schema } from "mongoose";

export interface IAvailibility extends Document {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  clientId: string;
}

const AvailibilitySchema = new Schema<IAvailibility>({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["booked", "available"],
  },
  clientId: { type: String, required: false },
});

export default mongoose.model("Availibility", AvailibilitySchema);
