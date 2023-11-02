import bcrypt from 'bcrypt'
import {Request} from "express";
import {UsersRepository} from "../repositories/usersRepository";
import add from 'date-fns/add'
import {jwtService} from "../application/jwt-service";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {RefreshTokenDeviceType, UserType} from "../types/generalTypes";
import {v4 as uuidv4} from "uuid";
import {emailManager} from "../managers/emailManager";
import {RefreshTokenDevicesRepository} from "../repositories/refreshTokenDevicesRepository";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";

@injectable()
export class AuthService {
  constructor(@inject(RefreshTokenDevicesRepository) protected refreshTokenDevicesRepository: RefreshTokenDevicesRepository,
              @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository,
              @inject(UsersRepository) protected usersRepository: UsersRepository
  ) {}

  async loginUser(req: Request, loginOrEmail: string, password: string):
    Promise<{accessToken: string, refreshToken: string} | boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail)
    if (!user) return false
    if (!user.emailConfirmation.isConfirmed) return false

    const isCredentialsCorrect = await bcrypt.compare(password, user.accountData.passwordHash)

    if (isCredentialsCorrect) {
      const deviceId = new ObjectId()
      const accessToken = await jwtService.createAccessJWT(user.id)
      const refreshToken = await jwtService.createRefreshJWT(user.id, deviceId)

      const newDevice = await this._createRefreshTokenDeviceModel(req, deviceId, user.id, refreshToken)
      await this.refreshTokenDevicesRepository.setNewDevice(newDevice)
      return {accessToken, refreshToken}
    } else {
      return false
    }
  }

  async logoutUser(req: Request): Promise<boolean> {
    if (!req.cookies.refreshToken) return false

    try {
      const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)
      if (!result?.userId) return false

      const session = await this.refreshTokenDevicesRepository.findDeviceById(result?.deviceId)
      if (!session) return false

      return await this.refreshTokenDevicesRepository.removeSpecifiedSession(result.userId, result.deviceId)
    } catch (error) {
      return false
    }
  }

  async createUser(email: string, login: string, password: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser: UserType = {
      id: new ObjectId(),
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
      commentsLikes: []
    }

    try {
      await emailManager.sendEmailConfirmationMessage(newUser)
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error)
      await this.usersRepository.deleteUser(newUser.id)
      return false
    }

    return !!await this.usersRepository.createUser(newUser)
  }

  async sendRecoveryPasswordCode(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email)

    if (user) {
      try {
        const recoveryCode = await jwtService.createPasswordRecoveryJWT(user.id)

        await emailManager.sendPasswordRecoveryMessage(user, recoveryCode)
      } catch (error) {
        console.log('sendPasswordRecoveryMessage error', error)
      }
    }
  }

  async updatePassword(newPassword: string, recoveryCode: string): Promise<boolean> {
    const result: any = await jwtService.verifyPasswordRecoveryCode(recoveryCode)
    if (!result) return false

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    return await this.usersRepository.changeUserPassword(result.userId, newPasswordHash)
  }

  async refreshTokens(userId: ObjectId, deviceId: ObjectId): Promise<{accessToken: string, refreshToken: string}> {
    const accessToken = await jwtService.createAccessJWT(userId)
    const refreshToken = await jwtService.createRefreshJWT(userId, deviceId)

    try {
      const result: any = await jwtService.verifyRefreshToken(refreshToken)
      const lastActiveDate = new Date(result.iat * 1000)
      const expirationDate = new Date(result.exp * 1000)

      await this.refreshTokenDevicesRepository.updateExistingSession(deviceId, lastActiveDate, expirationDate)
    } catch (error) {
      console.log(error)
    }

    return {accessToken, refreshToken}
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCode(code)
    if (!user) return false

    return await this.usersRepository.updateConfirmation(user.id)
  }

  async resendEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user) return false

    try {
      const newCode = uuidv4()
      const newExpirationDate = add(new Date(), {hours: 1, minutes: 30})
      await this.usersRepository.updateConfirmationCodeAndExpirationTime(user.id, newExpirationDate, newCode)

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
  }

  async checkAndFindUserByAccessToken(token: string): Promise<ViewUserModel | null> {
    const userId: ObjectId | null = await jwtService.getUserIdByAccessToken(token)
    if (!userId) return null

    return await this.usersQueryRepository.findUserById(userId)
  }

  async _createRefreshTokenDeviceModel(req: Request, deviceId: ObjectId, userId: ObjectId, refreshToken: string): Promise<RefreshTokenDeviceType> {
    const newDevice: RefreshTokenDeviceType = new RefreshTokenDeviceType(
      new ObjectId(),
      req.headers['x-forwarded-for'] as string || (req.socket.remoteAddress ?? ''),
      req.headers["user-agent"] ?? 'unknown',
      new Date(),
      new Date(),
      deviceId,
      userId
    )

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