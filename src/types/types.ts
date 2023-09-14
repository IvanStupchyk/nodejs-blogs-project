import {Request} from "express";

type ErrorMessageType = {
  message: string,
  field: string
}

export type CreateVideoErrorType = {
  errorsMessages: Array<ErrorMessageType>
}
export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>