import {Request} from "express";
import {jwtService} from "../../application/jwt-service";
import {UsersQueryRepository} from "../../infrastructure/repositories/usersQueryRepository";
import {DevicesRepository} from "../../infrastructure/repositories/DevicesRepository";
import {HTTP_STATUSES} from "../../utils";
import {inject, injectable} from "inversify";
import {UserType} from "../../dto/userDto";

@injectable()
export class DevicesService  {
  constructor(
    @inject(DevicesRepository) protected refreshTokenDevicesRepository: DevicesRepository,
    @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository
  ) {}

  async deleteSession(req: Request, deviceId: string): Promise<number> {
    if (!req.cookies.refreshToken) return HTTP_STATUSES.UNAUTHORIZED_401
    if (!deviceId) return HTTP_STATUSES.NOT_FOUND_404

    try {
      const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)
      if (!result?.userId) return HTTP_STATUSES.UNAUTHORIZED_401

      const user: UserType | null = await this.usersQueryRepository.fetchAllUserDataById(result.userId)
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