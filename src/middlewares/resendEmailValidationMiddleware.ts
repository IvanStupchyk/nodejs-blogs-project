import {body} from "express-validator";
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";

const usersQueryRepository = new UsersQueryRepository()

export const resendEmailValidationMiddleware = [
  body('email')
    .isString()
    .trim()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .custom(async value => {
      const user = await usersQueryRepository.findUserByLoginOrEmail(value)

      if (user === null) {
        throw new Error("email doesn't exist in the system")
      }
      if (user.emailConfirmation.isConfirmed) {
        throw new Error('email is already confirmed')
      }
    }),
]