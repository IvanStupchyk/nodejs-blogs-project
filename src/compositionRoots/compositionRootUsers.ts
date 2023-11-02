import 'reflect-metadata'
import {UsersRepository} from "../repositories/usersRepository";
import {UsersService} from "../domains/users.service";
import {UsersController} from "../features/users/usersController";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {Container} from "inversify";

export const usersContainer = new Container()
usersContainer.bind(UsersController).to(UsersController)
usersContainer.bind(UsersService).to(UsersService)
usersContainer.bind(UsersRepository).to(UsersRepository)
usersContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
