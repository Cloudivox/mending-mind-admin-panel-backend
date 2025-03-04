import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  bio: string;
  userId: string;
  qualification: string;
  specialization: string;
  experience: string;
}

const ProfileSchema = new Schema<IProfile>(
  {
    bio: { type: String, required: true },
    userId: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: String, required: true },
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

export default mongoose.model("Profile", ProfileSchema);
