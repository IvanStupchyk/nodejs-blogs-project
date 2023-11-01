import {body} from "express-validator";
import {UsersRepository} from "../repositories/usersRepository";

const usersRepository = new UsersRepository()

export const confirmationValidationMiddleware = [
  body('code')
    .isString()
    .trim()
    .custom(async value => {
      const user = await usersRepository.findUserByConfirmationCode(value)

      if (user === null) {
        throw new Error('code is incorrect')
      }
      if (user.emailConfirmation.expirationDate < new Date()) {
        throw new Error('code is expired')
      }
      if (user.emailConfirmation.isConfirmed) {
        throw new Error('email is already confirmed')
      }
    }),
]