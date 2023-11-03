import {body} from "express-validator";
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";

const usersQueryRepository = new UsersQueryRepository()

export const confirmationValidationMiddleware = [
  body('code')
    .isString()
    .trim()
    .custom(async value => {
      const user = await usersQueryRepository.findUserByConfirmationCode(value)

      if (user === null) {
        throw new Error('code is incorrect')
      }
      if (!user.canBeConfirmed(value)) {
        throw new Error('code is expired')
      }
      if (user.emailConfirmation.isConfirmed) {
        throw new Error('email is already confirmed')
      }
    }),
]