import { Schema, model } from "mongoose";
import { Statistics } from "../interfaces/statistics.interface";

const statisticsSchema: Schema = new Schema({
  urlUid: { type: String, required: true, index: true},
  ip: { type: String, required: true },
  referer: { type: String },
  userAgent: { type: String },
  language: { type: String  },
  accept: { type: String  },
  createTime: {
    type: Date,
    default: new Date(),
  },
  available: {
    type: Boolean,
    default: 1,
  }
});

export const StatisticsModel = model<Statistics>("Statistics", statisticsSchema);
