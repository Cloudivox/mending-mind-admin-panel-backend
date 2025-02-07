import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  bio: string;
  userId: string;
  qualification: string;
  specialization: string;
  experience: string;
  phone: string;
}

const ProfileSchema = new Schema<IProfile>({
  bio: { type: String, required: true },
  userId: { type: String, required: true },
  qualification: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  phone: { type: String, required: true },
});

export default mongoose.model("Profile", ProfileSchema);
