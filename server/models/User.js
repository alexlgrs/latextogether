import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now}
});

export const User = model("User", userSchema);
