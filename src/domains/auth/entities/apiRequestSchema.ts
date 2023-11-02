import mongoose from "mongoose";
import {APIRequestsCountType} from "../../../types/generalTypes";

export const apiRequestSchema = new mongoose.Schema<APIRequestsCountType>({
  ip: {type: String, required: true},
  URL: {type: String, required: true},
  date: {type: Date, required: true}
})