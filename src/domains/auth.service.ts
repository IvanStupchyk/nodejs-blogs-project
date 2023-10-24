import bcrypt from 'bcrypt'
import {Request} from "express";
import {usersRepository} from "../repositories/usersRepository";
import add from 'date-fns/add'
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {RefreshTokenDeviceType, UserType} from "../types/generalTypes";
import {v4 as uuidv4} from "uuid";
import {emailManager} from "../managers/emailManager";
import {refreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";

export const authService = {
  async loginUser(req: Request, loginOrEmail: string, password: string):
    Promise<{accessToken: string, refreshToken: string} | boolean> {
    const user = await usersRepository.findUserByLoginOrEmail(loginOrEmail)
    if (!user) return false
    if (!user.emailConfirmation.isConfirmed) return false

    const isCredentialsCorrect = await bcrypt.compare(password, user.accountData.passwordHash)

    if (isCredentialsCorrect) {
      const deviceId = uuidv4()
      const accessToken = await jwtService.createAccessJWT(user.id)
      const refreshToken = await jwtService.createRefreshJWT(user.id, deviceId)

      const newDevice = await this._createRefreshTokenDeviceModel(req, deviceId, user.id, refreshToken)
      await refreshTokenDevicesRepository.setNewDevice(newDevice)
      return {accessToken, refreshToken}
    } else {
      return false
    }
  },

  async logoutUser(req: Request): Promise<boolean> {
    if (!req.cookies.refreshToken) return false

    try {
      const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)
      if (!result?.userId) return false

      const user: UserType | null = await usersQueryRepository.fetchAllUserData(result.userId)
      if (!user) return false
      if (user.invalidRefreshTokens.includes(req.cookies.refreshToken)) return false

      await refreshTokenDevicesRepository.removeSpecifiedSession(result.userId, result.deviceId)
      return await usersRepository.addInvalidRefreshToken(result.userId, req.cookies.refreshToken)
    } catch (error) {
      return false
    }
  },

  async createUser(email: string, login: string, password: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser: UserType = {
      id: uuidv4(),
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString()
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 30
        }),
        isConfirmed: false
      },
      invalidRefreshTokens: []
    }

    try {
      await emailManager.sendEmailConfirmationMessage(newUser)
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error)
      await usersRepository.deleteUser(newUser.id)
      return false
    }

    return !!await usersRepository.createUser(newUser)
  },

  async refreshTokens(userId: string, deviceId: string, cookies: {refreshToken: string}): Promise<{accessToken: string, refreshToken: string}> {
    const accessToken = await jwtService.createAccessJWT(userId)
    const refreshToken = await jwtService.createRefreshJWT(userId, deviceId)

    try {
      const result: any = await jwtService.verifyRefreshToken(refreshToken)
      const lastActiveDate = (result.iat).toString()
      const expirationDate = (result.exp).toString()

      await refreshTokenDevicesRepository.updateExistingSession(deviceId, lastActiveDate, expirationDate)
    } catch (error) {
      console.log(error)
    }

    await usersRepository.addInvalidRefreshToken(userId, cookies.refreshToken)

    return {accessToken, refreshToken}
  },

  async confirmEmail(code: string): Promise<boolean> {
    const user = await usersRepository.findUserByConfirmationCode(code)
    if (!user) return false

    return await usersRepository.updateConfirmation(user.id)
  },

  async resendEmail(email: string): Promise<boolean> {
    const user = await usersRepository.findUserByEmail(email)
    if (!user) return false

    try {
      const newCode = uuidv4()
      const newExpirationDate = add(new Date(), {hours: 1, minutes: 30})
      await usersRepository.updateConfirmationCodeAndExpirationTime(user.id, newExpirationDate, newCode)

      try {
        await emailManager.resendEmailConfirmationMessage(user.accountData.email, newCode)
      } catch (error) {
        console.log('resendEmailConfirmationMessage error', error)
      }


      return true
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error)
      return false
    }
  },

  async checkAndFindUserByAccessToken(token: string): Promise<ViewUserModel | null> {
    const userId: string | null = await jwtService.getUserIdByAccessToken(token)
    if (!userId) return null

    return await usersQueryRepository.findUserById(userId)
  },

  async _createRefreshTokenDeviceModel(req: Request, deviceId: string, userId: string, refreshToken: string): Promise<RefreshTokenDeviceType> {
    const newDevice: RefreshTokenDeviceType = {
      id: uuidv4(),
      ip: req.headers['x-forwarded-for'] as string || (req.socket.remoteAddress ?? ''),
      title: req.headers["user-agent"] ?? '',
      lastActiveDate: '',
      expirationDate: '',
      deviceId,
      userId
    }
    try {
      const result: any = await jwtService.verifyRefreshToken(refreshToken)
      newDevice.lastActiveDate = new Date(result.iat * 1000)
      newDevice.expirationDate = new Date(result.exp * 1000)
    } catch (error) {
      console.log(error)
    }

    return newDevice
  }
}