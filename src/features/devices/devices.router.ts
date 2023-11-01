import express from "express";
import {refreshTokenMiddleware} from "../../middlewares/refreshTokenMiddleware";
import {devicesController} from "../../compositionRoots/compositionRootDevices";

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