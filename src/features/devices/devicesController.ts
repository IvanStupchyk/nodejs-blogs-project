import {DevicesRepository} from "../../infrastructure/repositories/DevicesRepository";
import {DevicesService} from "../../domains/devices/devices.service";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithParams} from "../../types/types";
import {DeleteDeviceModel} from "./models/DeleteDeviceModel";
import {inject, injectable} from "inversify";

@injectable()
export class DevicesController {
  constructor(
    @inject(DevicesRepository) protected refreshTokenDevicesRepository: DevicesRepository,
    @inject(DevicesService) protected devicesService: DevicesService
  ) {
  }

  async getDevices(req: Request, res: Response) {
    const devices = await this.refreshTokenDevicesRepository.getUserSessions(req.userId)
    res.status(HTTP_STATUSES.OK_200).send(devices)
  }

  async removeAllSessions(req: Request, res: Response) {
    await this.refreshTokenDevicesRepository.removeAllExceptCurrentSessions(req.deviceId, req.userId)

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }

  async deleteDevice(req: RequestWithParams<DeleteDeviceModel>, res: Response) {
    const status = await this.devicesService.deleteSession(req, req.params.id)

    res.sendStatus(status)
  }
}