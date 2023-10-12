import bcrypt from 'bcrypt'
import {usersRepository} from "../repositories/usersRepository";

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<string | boolean> {
    const user = await usersRepository.loginUser(loginOrEmail)

    const isCredentialsCorrect = await bcrypt.compare(password, user?.passwordHash ?? '')

    if (isCredentialsCorrect) {
      return user!.id
    } else {
      return false
    }
  }
}