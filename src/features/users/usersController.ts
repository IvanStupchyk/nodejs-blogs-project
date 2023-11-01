import {UsersQueryRepository} from "../../repositories/usersQueryRepository";
import {UsersService} from "../../domains/users.service";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../types/types";
import {CreateUserModel} from "./models/CreateUserModel";
import {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {GetSortedUsersModel} from "./models/GetSortedUsersModel";
import {DeleteUserModel} from "./models/DeleteUserModel";

export class UsersController {
  constructor(protected usersService: UsersService, protected usersQueryRepository: UsersQueryRepository) {}

  async createUser(req: RequestWithBody<CreateUserModel>, res: Response) {
    const {login, password, email} = req.body
    const newUser = await this.usersService.createUser(login, password, email)

    res.status(HTTP_STATUSES.CREATED_201).send(newUser)
  }

  async getUser(req: RequestWithQuery<GetSortedUsersModel>, res: Response) {
    res.json(await this.usersQueryRepository.getSortedUsers(req.query))
  }

  async deleteUser(req: RequestWithParams<DeleteUserModel>, res: Response) {
    const isUserExist = await this.usersService.deleteUser(req.params.id)

    !isUserExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }
}