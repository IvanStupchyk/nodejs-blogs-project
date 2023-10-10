import express, {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody} from "../../types/types";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {LoginUserModel} from "./models/LoginUserModel";
import {loginValidationMiddleware} from "../../middlewares/loginValidationMiddleware";
import {authService} from "../../domains/auth.service";

export const authRouter = () => {
  const router = express.Router()

  router.post(
    '/login',
    ...loginValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<LoginUserModel>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const isCredentialsCorrect = await authService.loginUser(loginOrEmail, password)

    res.sendStatus(isCredentialsCorrect
      ? HTTP_STATUSES.NO_CONTENT_204
      : HTTP_STATUSES.UNAUTHORIZED_401
    )
  })

  return router
}