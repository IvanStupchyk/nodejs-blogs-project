import {UsersRepository} from "../repositories/usersRepository";
import {UsersService} from "../domains/users.service";
import {UsersController} from "../features/users/usersController";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";

const usersRepository = new UsersRepository()
const usersQueryRepository = new UsersQueryRepository()
const usersService = new UsersService(usersRepository)
export const usersController = new UsersController(usersService, usersQueryRepository)