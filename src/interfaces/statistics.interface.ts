import { Document } from "mongoose";
export interface Statistics extends Document {
  urlUid: string;
  ip: string;
  referer: string;
  userAgent: string;
  language: string;
  accept: string;
  createTime: Date;
  available: boolean;
}