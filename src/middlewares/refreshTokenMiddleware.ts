import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";

const refreshTokenDevicesRepository = new RefreshTokenDevicesRepository()
export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.refreshToken) {
    res.sendStatus( HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)

  if (result?.userId) {
    const session = await refreshTokenDevicesRepository.findDeviceById(result?.deviceId)
    if (!session) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    req.userId = result?.userId
    req.deviceId = result?.deviceId
    next()
    return
  } else {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }
}