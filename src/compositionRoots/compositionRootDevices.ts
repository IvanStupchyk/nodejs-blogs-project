import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {DevicesService} from "../domains/devices.service";
import {DevicesController} from "../features/devices/devicesController";

const refreshTokenDevicesRepository = new RefreshTokenDevicesRepository()
const usersQueryRepository = new UsersQueryRepository()
const devicesService = new DevicesService(refreshTokenDevicesRepository, usersQueryRepository)

export const devicesController = new DevicesController(refreshTokenDevicesRepository, devicesService)