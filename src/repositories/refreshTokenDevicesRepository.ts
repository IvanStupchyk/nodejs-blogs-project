import {DeviceModel} from "../db/db"
import {DeviceViewType} from "../types/generalTypes";
import {ObjectId} from "mongodb";
import 'reflect-metadata'
import {injectable} from "inversify";
import {DeviceType} from "../domains/devices/dto/createDeviceDto";

@injectable()
export class RefreshTokenDevicesRepository {
  async getUserSessions(userId: ObjectId): Promise<Array<DeviceViewType>> {
    const result: Array<DeviceType> = await DeviceModel
      .find({userId}, {_id: 0, __v: 0}).lean()

    return result.length ? result.map(el => {
      return {
        ip: el.ip,
        title: el.title,
        lastActiveDate: el.lastActiveDate,
        deviceId: el.deviceId
      }
    }) : []
  }

  async setNewDevice(device: DeviceType): Promise<boolean> {
    const deviceInstance = new DeviceModel()

    deviceInstance.id = device.id
    deviceInstance.ip = device.ip
    deviceInstance.title = device.title
    deviceInstance.lastActiveDate = device.lastActiveDate
    deviceInstance.expirationDate = device.expirationDate
    deviceInstance.deviceId = device.deviceId
    deviceInstance.userId = device.userId

    return !!await deviceInstance.save()
  }

  async updateExistingSession(deviceId: ObjectId, lastActiveDate: Date, expirationDate: Date): Promise<boolean> {
    const isUpdated = await DeviceModel
      .updateOne({deviceId}, {$set: {lastActiveDate, expirationDate}})
      .exec()

    return isUpdated.modifiedCount === 1
  }

  async removeSpecifiedSession(userId: ObjectId, deviceId: string): Promise<boolean> {
    const isDeleted = await DeviceModel
      .deleteOne({userId, deviceId})
      .exec()

    return isDeleted.deletedCount === 1
  }

  async findDeviceById(deviceId: string): Promise<boolean> {
    return !!await DeviceModel.findOne({deviceId}).exec()
  }

  async removeAllExceptCurrentSessions(deviceId: ObjectId, userId: ObjectId): Promise<boolean> {
    const deletedCount = await DeviceModel
      .deleteMany({deviceId: {$ne: deviceId}, userId})
      .exec()

    return deletedCount.deletedCount >= 0
  }
}