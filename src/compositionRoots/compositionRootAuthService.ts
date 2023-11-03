import 'reflect-metadata'
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../infrastructure/repositories/refreshTokenDevicesRepository";
import {UsersRepository} from "../infrastructure/repositories/usersRepository";
import {Container} from "inversify";

export const authServiceContainer = new Container()
authServiceContainer.bind(RefreshTokenDevicesRepository).to(RefreshTokenDevicesRepository)
authServiceContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
authServiceContainer.bind(UsersRepository).to(UsersRepository)