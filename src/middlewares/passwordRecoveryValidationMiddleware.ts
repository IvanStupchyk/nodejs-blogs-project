import {body} from "express-validator";

export const passwordRecoveryValidationMiddleware = [
  body('email')
    .isString()
    .trim()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Incorrect email format')
]