import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils/utils";

export const authBasicValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = btoa('admin:qwerty')

  if (req.headers.authorization === `Basic ${auth}`) {
    next()
  } else {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
  }
}