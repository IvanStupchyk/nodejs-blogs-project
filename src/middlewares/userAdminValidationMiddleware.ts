import {body} from "express-validator";
import {errorsConstants} from "../constants/errorsContants";
import {authBasicValidationMiddleware} from "./authBasicValidationMiddleware";

export const userAdminValidationMiddleware = [
  authBasicValidationMiddleware,

  body('login')
    .isString()
    .trim()
    .matches(/^[a-zA-Z0-9_-]*$/)
    .isLength({min: 3, max: 10})
    .withMessage(errorsConstants.user.login),

  body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage(errorsConstants.user.password),

  body('email')
    .isString()
    .trim()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage(errorsConstants.user.email)
]