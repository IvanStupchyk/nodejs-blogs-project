import jwt from 'jsonwebtoken'
import {settings} from "../settings";
import {ObjectId} from "mongodb";

export const jwtService = {
  async createAccessJWT(userId: ObjectId) {
    return jwt.sign({userId}, settings.JWT_ACCESS_SECRET, {expiresIn: 500})
  },

  async createRefreshJWT(userId: ObjectId, deviceId: ObjectId) {
    return jwt.sign(
      {userId, deviceId},
      settings.JWT_REFRESH_SECRET,
      {expiresIn: 1000}
    )
  },

  async createPasswordRecoveryJWT(userId: ObjectId) {
    return jwt.sign(
      {userId},
      settings.JWT_PASSWORD_RECOVERY,
      {expiresIn: '2h'}
    )
  },

  async verifyPasswordRecoveryCode(token: string) {
    try {
      return jwt.verify(token, settings.JWT_PASSWORD_RECOVERY)
    } catch (error) {
      return null
    }
  },

  async verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, settings.JWT_REFRESH_SECRET)
    } catch (error) {
      return null
    }
  },

  async getUserIdByAccessToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.JWT_ACCESS_SECRET)
      return result.userId
    } catch (error) {
      return null
    }
  },

  async getUserIdByRefreshToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.JWT_REFRESH_SECRET)
      return result.userId
    } catch (error) {
      return null
    }
  }
}