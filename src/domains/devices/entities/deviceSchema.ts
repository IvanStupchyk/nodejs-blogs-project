import mongoose from "mongoose";
import {DeviceType} from "../dto/createDeviceDto";

export const deviceSchema = new mongoose.Schema<DeviceType>({
  id: {type: String, required: true},
  ip: {type: String, required: true},
  title: {type: String, required: true},
  lastActiveDate: {type: Date, required: true},
  expirationDate: {type: Date, required: true},
  deviceId: {type: String, required: true},
  userId: {type: String, required: true}
})