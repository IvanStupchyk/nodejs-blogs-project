import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import {HTTP_STATUSES} from "../utils";

export const inputValidationErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req).formatWith(error => {
    // @ts-ignore
    return {
      field: error.path,
      message: error.msg
    }
  })

  const ArrayErrors = errors.array({onlyFirstError: true})

  if (!errors.isEmpty()) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
      errorsMessages: ArrayErrors
    })
  } else {
    next()
  }
}