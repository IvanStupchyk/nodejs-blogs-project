import {body} from "express-validator";
import {jwtService} from "../application/jwt-service";

export const newPasswordValidationMiddleware = [
  body('newPassword')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Wrong password length'),

  body('recoveryCode')
    .isString()
    .trim()
    .custom(async value => {
      const result: any = await jwtService.verifyPasswordRecoveryCode(value)

      if (result === null) {
        throw new Error('recovery code is incorrect')
      }
    }),
]