import bcrypt from 'bcrypt'
import {usersRepository} from "../repositories/usersRepository";

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<boolean> {
    const user = await usersRepository.loginUser(loginOrEmail)

    return bcrypt.compare(password, user?.passwordHash ?? '')
  }
}