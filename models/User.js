import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  email: { type: String, required: false },
  password: { type: String, required: true },
  id: { type: String },
  status: { type: String },
  role: { type: String },
});

export default mongoose.model("User", UserSchema);