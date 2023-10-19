import {Request, Response} from "express";
import {HTTP_STATUSES} from "../utils";
import {jwtService} from "../application/jwt-service";
import {usersRepository} from "../repositories/usersRepository";
import {usersQueryRepository} from "../repositories/usersQueryRepository";

export const refreshTokenMiddleware = async (req: Request, res: Response) => {
  if (!req.cookies.refreshToken) {
    res.sendStatus( HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)

  const invalidTokens = await usersQueryRepository.fetchInvalidRefreshToken(result.userId)
  if (invalidTokens!.invalidRefreshTokens.includes(req.cookies.refreshToken)) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }

  if (typeof result?.userId === 'string') {
    const accessToken = await jwtService.createAccessJWT(result.userId)
    const refreshToken = await jwtService.createRefreshJWT(result.userId)

    await usersRepository.addInvalidRefreshToken(result.userId, req.cookies.refreshToken)

    res.status(HTTP_STATUSES.OK_200)
      .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
      .send({accessToken})
    return
  } else {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
  }
}