import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {refreshTokenMiddleware} from "../../middlewares/refreshTokenMiddleware";
import {refreshTokenDevicesRepository} from "../../repositories/refreshTokenDevicesRepository";
import {RequestWithParams} from "../../types/types";
import {DeleteDeviceModel} from "./models/DeleteDeviceModel";
import {devicesService} from "../../domains/devices.service";

export const devicesRouter = () => {
  const router = express.Router()

  router.get(
    '/devices',
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {
      const devices = await refreshTokenDevicesRepository.getUserSessions(req.userId)
      res.status(HTTP_STATUSES.OK_200).send(devices)
  })

  router.delete(
    '/devices',
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {
      await refreshTokenDevicesRepository.removeAllExceptCurrentSessions(req.deviceId, req.userId)

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  router.delete(
    '/devices/:id',
    refreshTokenMiddleware,
    async (req: RequestWithParams<DeleteDeviceModel>, res: Response) => {
      const status = await devicesService.deleteSession(req, req.params.id)

      res.sendStatus(status)
    })

  return router
}