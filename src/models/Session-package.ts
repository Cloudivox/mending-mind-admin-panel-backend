import mongoose, { Document, Schema } from "mongoose";

export interface ISessionPackage extends Document {
  name: string;
  therapistId: string;
  clientId: string;
  sessionId: string;
  status: string;
  totalSessions: number;
  sessions: string[];
  goals: string[];
  installmentStatus: string;
  date: string;
}

const SessionPackageSchema = new Schema<ISessionPackage>({
  name: { type: String, required: true },
  therapistId: { type: String, required: true },
  clientId: { type: String, required: true },
  sessionId: { type: String, required: true },
  status: { type: String, required: true },
  totalSessions: { type: Number, required: true },
  sessions: { type: [String], required: true },
  goals: { type: [String], required: true },
  installmentStatus: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.model("SessionPackage", SessionPackageSchema);
