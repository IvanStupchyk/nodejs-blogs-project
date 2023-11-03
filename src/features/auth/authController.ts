import {AuthService} from "../../application/auth.service";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody} from "../../types/types";
import {LoginUserModel} from "./models/LoginUserModel";
import {CreateUserModel} from "../users/models/CreateUserModel";
import {RecoveryCodeToEmailModel} from "./models/RecoveryCodeToEmailModel";
import {NewPasswordModel} from "./models/NewPasswordModel";
import {ConfirmEmailModel} from "./models/ConfirmEmailModel";
import {ResendingCodeToEmailModel} from "./models/ResendingCodeToEmailModel";
import {inject, injectable} from "inversify";

@injectable()
export class AuthController {
  constructor(@inject(AuthService) protected authService: AuthService) {
  }

  async getOwnData(req: Request, res: Response) {
    res.status(HTTP_STATUSES.OK_200).send(
      {
        email: req.user?.email,
        login: req.user?.login,
        userId: req.user?.id
      }
    )
  }

  async login(req: RequestWithBody<LoginUserModel>, res: Response) {
    const {loginOrEmail, password} = req.body
    const result = await this.authService.loginUser(req, loginOrEmail, password)

    if (!result) {
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
  }

  async logout(req: Request, res: Response) {
    const isLogout = await this.authService.logoutUser(req)

    isLogout
      ? res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
  }

  async refreshToken(req: Request, res: Response) {
    const {accessToken, refreshToken} = await this.authService.refreshTokens(req.userId, req.deviceId)

    res.status(HTTP_STATUSES.OK_200)
      .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
      .send({accessToken})
  }

  async registration(req: RequestWithBody<CreateUserModel>, res: Response) {
    const isSentEmail = await this.authService.createUser(
      req.body.email,
      req.body.login,
      req.body.password
    )

    res.sendStatus(isSentEmail
      ? HTTP_STATUSES.NO_CONTENT_204
      : HTTP_STATUSES.BAD_REQUEST_400
    )
  }

  async passwordRecovery(req: RequestWithBody<RecoveryCodeToEmailModel>, res: Response) {
    await this.authService.sendRecoveryPasswordCode(req.body.email)

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }

  async newPassword(req: RequestWithBody<NewPasswordModel>, res: Response) {
    const isPasswordUpdated = await this.authService.updatePassword(req.body.newPassword, req.body.recoveryCode)

    res.sendStatus(isPasswordUpdated
      ? HTTP_STATUSES.NO_CONTENT_204
      : HTTP_STATUSES.BAD_REQUEST_400
    )
  }

  async registrationConfirmation(req: RequestWithBody<ConfirmEmailModel>, res: Response) {
    const isConfirmed = await this.authService.confirmEmail(req.body.code)

    res.sendStatus(isConfirmed
      ? HTTP_STATUSES.NO_CONTENT_204
      : HTTP_STATUSES.BAD_REQUEST_400
    )
  }

  async registrationEmailResending(req: RequestWithBody<ResendingCodeToEmailModel>, res: Response) {
    const isSentEmail = await this.authService.resendEmail(req.body.email)

    res.sendStatus(isSentEmail
      ? HTTP_STATUSES.NO_CONTENT_204
      : HTTP_STATUSES.BAD_REQUEST_400
    )
  }
}