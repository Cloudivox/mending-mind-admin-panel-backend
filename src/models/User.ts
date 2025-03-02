import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  status: string;
  role: string;
  phone: string;
  age: string;
  gender: string;
  organizationId: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String },
  status: { type: String },
  role: { type: String, enum: ["admin", "therapist", "part-time", "client"] },
  phone: { type: String },
  age: { type: String },
  gender: { type: String },
  organizationId: { type: String },
});

export default mongoose.model("User", UserSchema);
