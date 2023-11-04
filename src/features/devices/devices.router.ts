import express from "express";
import {refreshTokenMiddleware} from "../../middlewares/refreshTokenMiddleware";
import {DevicesController} from "./devicesController";
import {generalContainer} from "../../compositionRoot/generalRoot";

const devicesController = generalContainer.resolve(DevicesController)

export const devicesRouter = () => {
  const router = express.Router()

  router.get(
    '/devices',
    refreshTokenMiddleware,
    devicesController.getDevices.bind(devicesController)
  )

  router.delete(
    '/devices',
    refreshTokenMiddleware,
    devicesController.removeAllSessions.bind(devicesController)
  )

  router.delete(
    '/devices/:id',
    refreshTokenMiddleware,
    devicesController.deleteDevice.bind(devicesController)
  )

  return router
}