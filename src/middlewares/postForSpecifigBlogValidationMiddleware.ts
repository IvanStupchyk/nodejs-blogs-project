import {authValidationMiddleware} from "./authValidationMiddleware";
import {body} from "express-validator";
import {errorsConstants} from "../constants/errorsContants"

export const postForSpecificBlogValidationMiddleware = [
  authValidationMiddleware,

  body('title')
    .isString()
    .trim()
    .isLength({min: 1, max: 30})
    .withMessage(errorsConstants.post.title),

  body('shortDescription')
    .isString()
    .trim()
    .isLength({min: 1, max: 100})
    .withMessage(errorsConstants.post.shortDescription),

  body('content')
    .isString()
    .trim()
    .isLength({min: 1, max: 1000})
    .withMessage(errorsConstants.post.content),
]