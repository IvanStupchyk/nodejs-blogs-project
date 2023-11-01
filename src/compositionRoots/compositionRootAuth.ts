import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {AuthService} from "../domains/auth.service";
import {UsersRepository} from "../repositories/usersRepository";
import {AuthController} from "../features/auth/authController";

const refreshTokenDevicesRepository = new RefreshTokenDevicesRepository()
const usersQueryRepository = new UsersQueryRepository()
const usersRepository = new UsersRepository()
export const authService = new AuthService(
  refreshTokenDevicesRepository,
  usersQueryRepository,
  usersRepository
)

export const authController = new AuthController(authService)