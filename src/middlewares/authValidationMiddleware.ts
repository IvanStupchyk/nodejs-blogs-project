import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";

export const authValidationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const token = req.headers.authorization.split(' ')[1]

  const userId = await jwtService.getUserIdByToken(token)

  if (userId) {
    req.user = await usersQueryRepository.findUserById(userId)
    next()
    return
  }

  res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
}