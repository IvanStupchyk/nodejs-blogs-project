import mongoose from "mongoose";
import {EmailConfirmationType} from "../types/generalTypes";

export const emailConfirmationSchema = new mongoose.Schema<EmailConfirmationType>({
  confirmationCode: {type: String, required: true},
  expirationDate: {type: Date, required: true},
  isConfirmed: {type: Boolean, required: true}
})