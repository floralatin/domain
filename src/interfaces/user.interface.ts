import { Document } from "mongoose";
export interface User extends Document {
  uid: string;
  username: string;
  password: string;
  meta: object;
  createTime: Date;
  updateTime: Date;
  available: boolean;
}
