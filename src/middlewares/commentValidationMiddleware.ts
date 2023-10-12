import {authValidationMiddleware} from "./authValidationMiddleware";
import {body} from "express-validator";
import {errorsConstants} from "../constants/errorsContants"

export const commentValidationMiddleware = [
  authValidationMiddleware,

  body('content')
    .isString()
    .trim()
    .isLength({min: 20, max: 300})
    .withMessage(errorsConstants.comment.content),
]