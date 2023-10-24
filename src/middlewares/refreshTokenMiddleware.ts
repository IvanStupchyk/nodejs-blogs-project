import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.refreshToken) {
    res.sendStatus( HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)

  if (typeof result?.userId === 'string') {
    const user = await usersQueryRepository.fetchAllUserData(result.userId)
    if (user!.invalidRefreshTokens.includes(req.cookies.refreshToken)) {
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