import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {apiRequestRepository} from "../repositories/apiRequestsRepository";

export const apiRequestCountValidationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] as string || (req.socket.remoteAddress ?? '')

  await apiRequestRepository.addAPIRequest({
    ip,
    URL: req.originalUrl,
    date: new Date()
  })

  const timestamp = (new Date()).getTime() - 10000
  const filterDate = new Date(timestamp)
  const count = await apiRequestRepository.getCountApiRequestToOneEndpoint(req.originalUrl, ip, filterDate)

  if (count > 5) {
    res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
    return
  }
  next()
}