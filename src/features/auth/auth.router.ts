import express from "express";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {loginValidationMiddleware} from "../../middlewares/loginValidationMiddleware";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {userValidationMiddleware} from "../../middlewares/userValidationMiddleware";
import {confirmationValidationMiddleware} from "../../middlewares/confirmationValidationMiddleware";
import {resendEmailValidationMiddleware} from "../../middlewares/resendEmailValidationMiddleware";
import {refreshTokenMiddleware} from "../../middlewares/refreshTokenMiddleware";
import {apiRequestCountValidationMiddleware} from "../../middlewares/apiRequestCountValidationMiddleware";
import {passwordRecoveryValidationMiddleware} from "../../middlewares/passwordRecoveryValidationMiddleware";
import {newPasswordValidationMiddleware} from "../../middlewares/newPasswordValidationMiddleware";
import {authContainer} from "../../compositionRoots/compositionRootAuth";
import {AuthController} from "./authController";

const authController = authContainer.resolve(AuthController)

export const authRouter = () => {
  const router = express.Router()

  router.get(
    '/me',
    authValidationMiddleware,
    authController.getOwnData.bind(authController)
  )

  router.post(
    '/login',
    ...loginValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    authController.login.bind(authController)
  )

  router.post('/logout', authController.logout.bind(authController))

  router.post(
    '/refresh-token',
    refreshTokenMiddleware,
    authController.refreshToken.bind(authController)
  )

  router.post('/registration',
    ...userValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    authController.registration.bind(authController)
  )

  router.post('/password-recovery',
    ...passwordRecoveryValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    authController.passwordRecovery.bind(authController)
  )

  router.post('/new-password',
    ...newPasswordValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    authController.newPassword.bind(authController)
  )

  router.post('/registration-confirmation',
    ...confirmationValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    authController.registrationConfirmation.bind(authController)
  )

  router.post('/registration-email-resending',
    ...resendEmailValidationMiddleware,
    apiRequestCountValidationMiddleware,
    inputValidationErrorsMiddleware,
    authController.registrationEmailResending.bind(authController)
  )

  return router
}