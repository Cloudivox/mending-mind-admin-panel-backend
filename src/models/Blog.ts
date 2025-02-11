import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  desc: string;
  date: string;
  author: string;
  img: string;
  time: string;
  status: string;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  date: { type: String, required: false },
  author: { type: String, required: true },
  img: { type: String, required: false },
  time: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["pending", "approved", "rejected"],
  },
});

export default mongoose.model("Blog", BlogSchema);
