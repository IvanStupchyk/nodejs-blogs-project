import 'reflect-metadata'
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {AuthService} from "../domains/auth/auth.service";
import {UsersRepository} from "../repositories/usersRepository";
import {Container} from "inversify";

export const authContainer = new Container()
authContainer.bind(RefreshTokenDevicesRepository).to(RefreshTokenDevicesRepository)
authContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
authContainer.bind(UsersRepository).to(UsersRepository)
authContainer.bind(AuthService).to(AuthService)