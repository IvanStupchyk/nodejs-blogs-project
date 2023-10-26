import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody} from "../../types/types";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {LoginUserModel} from "./models/LoginUserModel";
import {loginValidationMiddleware} from "../../middlewares/loginValidationMiddleware";
import {authService} from "../../domains/auth.service";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {userValidationMiddleware} from "../../middlewares/userValidationMiddleware";
import {CreateUserModel} from "../users/models/CreateUserModel";
import {confirmationValidationMiddleware} from "../../middlewares/confirmationValidationMiddleware";
import {ConfirmEmailModel} from "./models/ConfirmEmailModel";
import {ResendingCodeToEmailModel} from "./models/ResendingCodeToEmailModel";
import {resendEmailValidationMiddleware} from "../../middlewares/resendEmailValidationMiddleware";
import {refreshTokenMiddleware} from "../../middlewares/refreshTokenMiddleware";
import {apiRequestCountValidationMiddleware} from "../../middlewares/apiRequestCountValidationMiddleware";
import {passwordRecoveryValidationMiddleware} from "../../middlewares/passwordRecoveryValidationMiddleware";
import {RecoveryCodeToEmailModel} from "./models/RecoveryCodeToEmailModel";
import {newPasswordValidationMiddleware} from "../../middlewares/newPasswordValidationMiddleware";
import {NewPasswordModel} from "./models/NewPasswordModel";

export const authRouter = () => {
  const router = express.Router()

  router.get(
    '/me',
    authValidationMiddleware,
    async (req: Request, res: Response) => {
      res.status(HTTP_STATUSES.OK_200).send({
        email: req.user?.email,
        login: req.user?.login,
        userId: req.user?.id
      })
  })

  router.post(
    '/login',
    ...loginValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<LoginUserModel>, res: Response) => {
    const {loginOrEmail, password} = req.body
    const result = await authService.loginUser(req, loginOrEmail, password)

    if(!result) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
    }

    if (typeof result === 'object') {
      res.status(HTTP_STATUSES.OK_200)
        .cookie(
          'refreshToken',
          result.refreshToken,
          {httpOnly: true, secure: true}
        )
        .send({accessToken: result.accessToken})
    }
  })

  router.post('/logout',
    async (req: Request, res: Response) => {
      const isLogout = await authService.logoutUser(req)

      isLogout
        ? res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  router.post('/refresh-token',
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {
      const {accessToken, refreshToken} = await authService.refreshTokens(req.userId, req.deviceId)

      res.status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        .send({accessToken})
  })

  router.post('/registration',
    ...userValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<CreateUserModel>, res: Response) => {
      const isSentEmail = await authService.createUser(
        req.body.email,
        req.body.login,
        req.body.password
      )


      res.sendStatus(isSentEmail
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.BAD_REQUEST_400
      )
    }
  )

  router.post('/password-recovery',
    ...passwordRecoveryValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<RecoveryCodeToEmailModel>, res: Response) => {
      await authService.sendRecoveryPasswordCode(req.body.email)

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
  )

  router.post('/new-password',
    ...newPasswordValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<NewPasswordModel>, res: Response) => {
      const isPasswordUpdated = await authService.updatePassword(req.body.newPassword, req.body.recoveryCode)

      res.sendStatus(isPasswordUpdated
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.BAD_REQUEST_400
      )
    }
  )

  router.post('/registration-confirmation',
    ...confirmationValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<ConfirmEmailModel>, res: Response) => {
      const isConfirmed = await authService.confirmEmail(req.body.code)

      res.sendStatus(isConfirmed
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.BAD_REQUEST_400
      )
    }
  )

  router.post('/registration-email-resending',
    ...resendEmailValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<ResendingCodeToEmailModel>, res: Response) => {
      const isSentEmail = await authService.resendEmail(req.body.email)

      res.sendStatus(isSentEmail
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.BAD_REQUEST_400
      )
  })

  return router
}