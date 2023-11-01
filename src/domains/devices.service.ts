import {Request} from "express";
import {jwtService} from "../application/jwt-service";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {UserType} from "../types/generalTypes";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {HTTP_STATUSES} from "../utils";

export class DevicesService  {
  constructor(
    protected refreshTokenDevicesRepository: RefreshTokenDevicesRepository,
    protected usersQueryRepository: UsersQueryRepository
  ) {}

  async deleteSession(req: Request, deviceId: string): Promise<number> {
    if (!req.cookies.refreshToken) return HTTP_STATUSES.UNAUTHORIZED_401
    if (!deviceId) return HTTP_STATUSES.NOT_FOUND_404

    try {
      const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)
      if (!result?.userId) return HTTP_STATUSES.UNAUTHORIZED_401

      const user: UserType | null = await this.usersQueryRepository.fetchAllUserData(result.userId)
      if (!user) return HTTP_STATUSES.UNAUTHORIZED_401

      const isDeviceIdExist = await this.refreshTokenDevicesRepository.findDeviceById(deviceId)
      if (!isDeviceIdExist) return HTTP_STATUSES.NOT_FOUND_404
      if (result.deviceId === deviceId) return HTTP_STATUSES.FORBIDDEN_403

      const isDeleted = await this.refreshTokenDevicesRepository.removeSpecifiedSession(result.userId, deviceId)

      if (!isDeleted) return HTTP_STATUSES.FORBIDDEN_403
      return HTTP_STATUSES.NO_CONTENT_204
    } catch (error) {
      return HTTP_STATUSES.UNAUTHORIZED_401
    }
  }
}