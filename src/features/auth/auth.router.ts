import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody} from "../../types/types";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {LoginUserModel} from "./models/LoginUserModel";
import {loginValidationMiddleware} from "../../middlewares/loginValidationMiddleware";
import {authService} from "../../domains/auth.service";
import {jwtService} from "../../application/jwt-service";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {usersQueryRepository} from "../../repositories/usersQueryRepository";

export const authRouter = () => {
  const router = express.Router()

  router.get('/me', authValidationMiddleware, async (req: Request, res: Response) => {
   const user = await usersQueryRepository.findUserById(req.user!.id)

    if (user) {
      res.status(HTTP_STATUSES.OK_200).send({
        email: user.email,
        login: user.login,
        userId: user.id
      })
    }
  })

  router.post(
    '/login',
    ...loginValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<LoginUserModel>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const id = await authService.loginUser(loginOrEmail, password)

    if (typeof id === 'string') {
      const token = await jwtService.createJWT(id)
      res.status(HTTP_STATUSES.OK_200).send({
        accessToken: token
      })
    } else {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
  })

  return router
}