import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {authService} from "../domains/auth.service";
import {jwtService} from "../application/jwt-service";

export const authValidationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const accessToken = req.headers.authorization.split(' ')[1]
  const refreshToken = req.cookies?.refreshToken

  const user = await authService.checkAndFindUserByToken(accessToken)

  if (user) {
    req.user = user
    next()
    return
  } else {
    try {
      const decodedRefreshToken: any = await jwtService.verifyRefreshToken(refreshToken)
      if (!decodedRefreshToken?.userId) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
      }
      const accessToken = await jwtService.createAccessJWT(decodedRefreshToken.userId)

      req.user = await authService.checkAndFindUserByToken(accessToken)
      next()
      return
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
  }

  res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
}