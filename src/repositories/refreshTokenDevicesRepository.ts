import {refreshTokenDevicesCollections} from "../db/db"
import {RefreshTokenDeviceType, RefreshTokenDeviceViewType} from "../types/generalTypes";

export const refreshTokenDevicesRepository = {
  async getUserSessions(userId: string): Promise<Array<RefreshTokenDeviceViewType>> {
    const result = await refreshTokenDevicesCollections
      .find({userId}, { projection: {_id: 0} }).toArray()

    return result.length ? result.map(el => {
      return {
        ip: el.ip,
        title: el.title,
        lastActiveDate: el.lastActiveDate,
        deviceId: el.deviceId
      }
    }) : []
  },

  async setNewDevice(device: RefreshTokenDeviceType): Promise<boolean> {
    return !!await refreshTokenDevicesCollections.insertOne({...device})
  },

  async updateExistingSession(deviceId: string, lastActiveDate: string, expirationDate: string): Promise<boolean> {
    const isUpdated = await refreshTokenDevicesCollections.updateOne({deviceId}, {$set: {lastActiveDate, expirationDate}})

    return isUpdated.modifiedCount === 1
  },

  async removeSpecifiedSession(userId: string, deviceId: string): Promise<boolean> {
    const isDeleted = await refreshTokenDevicesCollections.deleteOne({userId, deviceId})

    return isDeleted.deletedCount === 1
  },

  async removeAllExceptCurrentSessions(deviceId: string, userId: string): Promise<boolean> {
    const deletedCount = await refreshTokenDevicesCollections.deleteMany({deviceId: {$ne: deviceId}, userId})
    return deletedCount.deletedCount >= 0
  }
}