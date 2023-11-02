import 'reflect-metadata'
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {DevicesService} from "../domains/devices/devices.service";
import {Container} from "inversify";

export const devicesContainer = new Container()
devicesContainer.bind(RefreshTokenDevicesRepository).to(RefreshTokenDevicesRepository)
devicesContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
devicesContainer.bind(DevicesService).to(DevicesService)