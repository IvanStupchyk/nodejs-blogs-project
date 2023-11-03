import 'reflect-metadata'
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../infrastructure/repositories/refreshTokenDevicesRepository";
import {AuthService} from "../application/auth.service";
import {UsersRepository} from "../infrastructure/repositories/usersRepository";
import {Container} from "inversify";

export const authContainer = new Container()
authContainer.bind(RefreshTokenDevicesRepository).to(RefreshTokenDevicesRepository)
authContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
authContainer.bind(UsersRepository).to(UsersRepository)
authContainer.bind(AuthService).to(AuthService)