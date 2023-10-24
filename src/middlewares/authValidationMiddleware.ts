import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {authService} from "../domains/auth.service";

export const authValidationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const accessToken = req.headers.authorization.split(' ')[1]

  const user = await authService.checkAndFindUserByAccessToken(accessToken)

  if (user) {
    req.user = user
    next()
    return
  } else {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }
}