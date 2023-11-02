import 'reflect-metadata'
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {UsersRepository} from "../repositories/usersRepository";
import {Container} from "inversify";

export const authServiceContainer = new Container()
authServiceContainer.bind(RefreshTokenDevicesRepository).to(RefreshTokenDevicesRepository)
authServiceContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
authServiceContainer.bind(UsersRepository).to(UsersRepository)