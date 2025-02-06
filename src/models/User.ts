import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  id: string;
  status: string;
  role: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: false },
  password: { type: String },
  id: { type: String },
  status: { type: String },
  role: { type: String, enum: ["admin", "therapist", "part-time","user"] },
});

export default mongoose.model("User", UserSchema);