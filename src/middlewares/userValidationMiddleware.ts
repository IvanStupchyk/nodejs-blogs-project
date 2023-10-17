import {body} from "express-validator";
import {errorsConstants} from "../constants/errorsContants";
import {usersRepository} from "../repositories/usersRepository";

export const userValidationMiddleware = [
  body('login')
    .isString()
    .trim()
    .matches(/^[a-zA-Z0-9_-]*$/)
    .isLength({min: 3, max: 10})
    .custom(async value => {
      const foundUser = await usersRepository.findUserByLoginOrEmail(value)

      if (foundUser !== null) {
        throw new Error('It should be unique login')
      }
    }),

  body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage(errorsConstants.user.password),

  body('email')
    .isString()
    .trim()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .custom(async value => {
      const foundUser = await usersRepository.findUserByLoginOrEmail(value)

      if (foundUser !== null) {
        throw new Error('It should be unique email')
      }
    }),
]