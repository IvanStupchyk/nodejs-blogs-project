import express, {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../types/types";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {CreateUserModel} from "./models/CreateUserModel";
import {usersService} from "../../domains/users.service";
import {userValidationMiddleware} from "../../middlewares/userValidationMiddleware";
import {GetSortedUsersModel} from "./models/GetSortedUsersModel";
import {DeleteUserModel} from "./models/DeleteUserModel";

export const getUserRouter = () => {
  const router = express.Router()

  router.get('/', async (req: RequestWithQuery<GetSortedUsersModel>, res: Response) => {
    res.json(await usersService.getSortedUsers(req.query))
  })

  router.post(
    '/',
    ...userValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<CreateUserModel>, res: Response) => {
    const {login, password, email} = req.body
    const newUser = await usersService.createUser(login, password, email)

    res.status(HTTP_STATUSES.CREATED_201).send(newUser)
  })

  router.delete('/:id', authValidationMiddleware, async (req: RequestWithParams<DeleteUserModel>, res: Response) => {
    const isUserExist = await usersService.deleteUser(req.params.id)

    !isUserExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}