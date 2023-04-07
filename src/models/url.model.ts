import { model, Schema, Document } from "mongoose";
import { Url } from "../interfaces/url.interface";

const urlSchema: Schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    maxLength: 8,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  userUid: {
    type: String,
    required: true,
    unique: true
  },
  meta: {
    type: Object,
    default: {},
  },
  expiredTime: {
    type: Date,
    default: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
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
}, { shardKey: { uid: 1 } });

urlSchema.index({ url: 'hashed' });
urlSchema.index({ code: 1 });
urlSchema.index({ uid: 1 }, { unique: true });

export const UrlModel = model<Url & Document>("Url", urlSchema);
