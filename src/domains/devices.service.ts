import {Request} from "express";
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";
import {UserType} from "../types/generalTypes";
import {refreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {HTTP_STATUSES} from "../utils";

export const devicesService = {
  async deleteSession(req: Request, deviceId: string): Promise<number> {
    if (!req.cookies.refreshToken) return HTTP_STATUSES.UNAUTHORIZED_401
    if (!deviceId) return HTTP_STATUSES.NOT_FOUND_404

    try {
      const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)
      if (!result?.userId) return HTTP_STATUSES.UNAUTHORIZED_401

      const user: UserType | null = await usersQueryRepository.fetchAllUserData(result.userId)
      if (!user || user.invalidRefreshTokens.includes(req.cookies.refreshToken)) return HTTP_STATUSES.UNAUTHORIZED_401

      const isDeviceIdExist = await refreshTokenDevicesRepository.findDeviceId(deviceId)
      if (!isDeviceIdExist) return HTTP_STATUSES.NOT_FOUND_404
      if (user.id !== result.userId || result.deviceId === deviceId) return HTTP_STATUSES.FORBIDDEN_403

      const isDeleted = await refreshTokenDevicesRepository.removeSpecifiedSession(result.userId, deviceId)

      if (!isDeleted) return HTTP_STATUSES.NOT_FOUND_404
      return HTTP_STATUSES.NO_CONTENT_204
      // await usersRepository.addInvalidRefreshToken(result.userId, req.cookies.refreshToken)
    } catch (error) {
      return HTTP_STATUSES.UNAUTHORIZED_401
    }
  }
}