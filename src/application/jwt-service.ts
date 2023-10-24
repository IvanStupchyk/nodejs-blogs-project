import jwt from 'jsonwebtoken'
import {settings} from "../settings";

export const jwtService = {
  async createAccessJWT(userId: string) {
    return jwt.sign({userId}, settings.JWT_ACCESS_SECRET, {expiresIn: 10})
  },

  async createRefreshJWT(userId: string, deviceId: string) {
    return jwt.sign(
      {userId, deviceId},
      settings.JWT_REFRESH_SECRET,
      {expiresIn: 2000}
    )
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
  }
}