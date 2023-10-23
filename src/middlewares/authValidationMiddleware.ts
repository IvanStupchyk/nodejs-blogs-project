import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {authService} from "../domains/auth.service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";

export const authValidationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const accessToken = req.headers.authorization.split(' ')[1]
  //first implementation
  // const refreshToken = req.cookies?.refreshToken

  const user = await authService.checkAndFindUserByAccessToken(accessToken)

  if (user) {
    const invalidTokens = await usersQueryRepository.fetchInvalidRefreshToken(user.id)
    if (invalidTokens!.invalidRefreshTokens.includes(req.cookies.refreshToken)) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
    }

    req.user = user
    next()
    return
  } else {
    try {
      //first implementation
      // const decodedRefreshToken: any = await jwtService.verifyRefreshToken(refreshToken)
      // if (!decodedRefreshToken?.userId) {
      //   res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      //   return
      // }

      // in reality, we need to set up the new access token in headers but with current implementation
      // we can't do it because we send the access token in the body, but it's only middleware for
      // other request, so we can't mutate them

      //first implementation
      // const accessToken = await jwtService.createAccessJWT(decodedRefreshToken.userId)
      // req.user = await authService.checkAndFindUserByAccessToken(accessToken)

      //second implementation
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
      return
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
  }

  res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
}