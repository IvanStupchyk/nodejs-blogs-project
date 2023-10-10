import {body} from "express-validator";
import {errorsConstants} from "../constants/errorsContants";

export const loginValidationMiddleware = [
  body('loginOrEmail')
    .isString()
    .trim()
    .withMessage(errorsConstants.login.loginOrEmail),

  body('password')
    .isString()
    .trim()
    .withMessage(errorsConstants.login.password),
]