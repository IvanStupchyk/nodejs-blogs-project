import {body} from "express-validator";
import {errorsConstants} from "../constants/errorsContants";
import {authBasicValidationMiddleware} from "./authBasicValidationMiddleware";

export const blogValidationMiddleware = [
  authBasicValidationMiddleware,

  body('name')
    .isString()
    .trim()
    .isLength({min: 1, max: 15})
    .withMessage(errorsConstants.blog.name),

  body('description')
    .isString()
    .trim()
    .isLength({min: 1, max: 500})
    .withMessage(errorsConstants.blog.description),

  body('websiteUrl')
    .isString()
    .trim()
    .isLength({max: 100})
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage(errorsConstants.blog.websiteUrl)
]