import {body} from "express-validator";
import {usersRepository} from "../repositories/usersRepository";

export const resendEmailValidationMiddleware = [
  body('email')
    .isString()
    .trim()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .custom(async value => {
      const user = await usersRepository.findUserByEmail(value)

      if (user === null) {
        throw new Error("email doesn't exist in the system")
      }
      if (user.emailConfirmation.isConfirmed) {
        throw new Error('email is already confirmed')
      }
    }),
]