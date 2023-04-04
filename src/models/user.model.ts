import { model, Schema, Document } from "mongoose";
import { User } from "../interfaces/user.interface";

const userSchema: Schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  meta: {
    type: Object,
    default: {},
  },
  createTime: {
    type: Date,
    default: new Date(),
  },
  updateTime: {
    type: Date,
    default: new Date(),
  },
  available: {
    type: Boolean,
    default: 1,
  },
});

userSchema.index({ username: 'hashed' });

export const UserModel = model<User & Document>("User", userSchema);
