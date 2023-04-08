import { Document } from "mongoose";
export interface Statistics extends Document {
  urlUid: string;
  ip: string;
  refer: string;
  userAgent: string;
  language: string;
  accept: string;
  createTime: Date;
  available: boolean;
}