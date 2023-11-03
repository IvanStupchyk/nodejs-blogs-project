import mongoose from "mongoose";
import {AccountDataType} from "../types/generalTypes";

export const accountDataSchema = new mongoose.Schema<AccountDataType>({
  login: {type: String, required: true},
  email: {type: String, required: true},
  passwordHash: {type: String, required: true},
  createdAt: {type: String, required: true}
})