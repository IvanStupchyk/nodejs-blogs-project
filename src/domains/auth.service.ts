import bcrypt from 'bcrypt'
import {Request} from "express";
import {usersRepository} from "../repositories/usersRepository";
import add from 'date-fns/add'
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {InvalidRefreshTokensType, UserType} from "../types/generalTypes";
import {v4 as uuidv4} from "uuid";
import {emailManager} from "../managers/emailManager";

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<string | boolean> {
    const user = await usersRepository.findUserByLoginOrEmail(loginOrEmail)
    if (!user) return false
    if (!user.emailConfirmation.isConfirmed) return false

    const isCredentialsCorrect = await bcrypt.compare(password, user.accountData.passwordHash)

    if (isCredentialsCorrect) {
      return user.id
    } else {
      return false
    }
  },

  async logoutUser(req: Request): Promise<boolean> {
    if (!req.cookies.refreshToken) return false

    try {
      const result: any = await jwtService.verifyRefreshToken(req.cookies.refreshToken)
      if (!result?.userId) return false

      const user: InvalidRefreshTokensType | null = await usersQueryRepository.fetchInvalidRefreshToken(result.userId)
      if (!user) return false
      if (user.invalidRefreshTokens.includes(req.cookies.refreshToken)) return false

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

  async checkAndFindUserByToken(token: string): Promise<ViewUserModel | null> {
    const userId: string | null = await jwtService.getUserIdByToken(token)
    if (!userId) return null

    return await usersQueryRepository.findUserById(userId)
  }
}