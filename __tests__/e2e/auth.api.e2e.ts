import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {errorsConstants} from "../../src/constants/errorsContants";
import {client} from "../../src/db/db";
import {CreateUserModel} from "../../src/features/users/models/CreateUserModel";
import {usersTestManager} from "../utils/usersTestManager";
import {ViewUserModel} from "../../src/features/users/models/ViewUserModel";
import {UserType} from "../../src/types/generalTypes";
import {emailManager} from "../../src/managers/emailManager";
import {usersRepository} from "../../src/repositories/usersRepository";
const { parse } = require('cookie')

const sleep = (seconds: number) => new Promise((r) => setTimeout(r, seconds * 1000))

const getRequest = () => {
  return request(app)
}

describe('tests for /auth', () => {
  const invalidUserData: CreateUserModel = {
    login: '',
    password: '',
    email: ''
  }

  let validUserData: CreateUserModel = {
    login: 'Nick',
    password: '123456',
    email: 'nickNick@gmail.com'
  }

  let secondUserData: CreateUserModel = {
    login: 'Ivan',
    password: '123456',
    email: 'ivan@gmail.com'
  }

  beforeAll( async () => {
    await client.connect()

    jest.mock('../../src/managers/emailManager')

    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  let simpleUser: UserType
  let superAdminUser: ViewUserModel
  it('should not register user with incorrect credentials', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/registration`)
      .send(invalidUserData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
            errorsMessages: [
              {
                field: 'login',
                message: 'Invalid value'
              },
              {
                field: 'password',
                message: errorsConstants.user.password
              },
              {
                field: 'email',
                message: 'Invalid value'
              }
            ]
      })
  })

  it('should create a super user if the user sends the valid data', async () => {
    const { createdUser } = await usersTestManager.createUser(validUserData)

    superAdminUser = createdUser

    await getRequest()
      .get(RouterPaths.users)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdUser]
      })
  })

  it('should not register user with not unique login or email', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/registration`)
      .send(validUserData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'login',
            message: 'It should be unique login'
          },
          {
            field: 'email',
            message: 'It should be unique email'
          }
        ]
      })
  })

  it('should register user with correct credentials', async () => {
    emailManager.sendEmailConfirmationMessage = jest.fn()

    await getRequest()
      .post(`${RouterPaths.auth}/registration`)
      .send(secondUserData)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const newUser = await usersRepository.findUserByEmail(secondUserData.email)
    if (newUser) simpleUser = newUser
    expect(emailManager.sendEmailConfirmationMessage).toHaveBeenCalledTimes(1)
    expect(emailManager.sendEmailConfirmationMessage).toHaveBeenCalledWith(newUser)
  })

  it('should not resend confirmation code to email if email is incorrect', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({
        email: []
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'email',
            message: 'Invalid value'
          }
        ]
      })

    await getRequest()
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({
        email: 'aaa@gmail.com'
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'email',
            message: "email doesn't exist in the system"
          }
        ]
      })

    await getRequest()
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({
        email: superAdminUser.email
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'email',
            message: 'email is already confirmed'
          }
        ]
      })
  })

  it('should resend confirmation code to email if email is correct', async () => {
    emailManager.resendEmailConfirmationMessage = jest.fn()

    await getRequest()
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({
        email: simpleUser.accountData.email
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const newUser = await usersRepository.findUserByEmail(simpleUser.accountData.email)
    if (newUser) simpleUser = newUser
    expect(emailManager.sendEmailConfirmationMessage).toHaveBeenCalledTimes(1)
  })

  it('should not confirm email if code is not a string', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/registration-confirmation`)
      .send({
        code: []
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'code',
            message: 'Invalid value'
          }
        ]
      })
  })

  it('should not confirm email if code is incorrect', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/registration-confirmation`)
      .send({
        code: 'dqwdq'
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'code',
            message: 'code is incorrect'
          }
        ]
      })
  })

  it('should not confirm email if email is already confirmed', async () => {
    const adminUser = await usersRepository.findUserByEmail(superAdminUser.email)

    await getRequest()
      .post(`${RouterPaths.auth}/registration-confirmation`)
      .send({
        code: adminUser?.emailConfirmation.confirmationCode
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'code',
            message: 'code is expired'
          }
        ]
      })
  })

  it('should not log in user if email is not confirmed', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: secondUserData.login,
        password: secondUserData.password
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  it('should confirm email if code is correct', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/registration-confirmation`)
      .send({
        code: simpleUser?.emailConfirmation.confirmationCode
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const currentUser = await usersRepository.findUserByEmail(simpleUser.accountData.email)
    expect(currentUser?.emailConfirmation.isConfirmed).toEqual(true)
  })

  it('should not return my data if I am not authorized', async () => {
    const headers = {
      'Authorization': `Bearer wefwef`
    }

    await getRequest()
      .get(`${RouterPaths.auth}/me`)
      .set('Cookie', `refreshToken=wef`)
      .set(headers)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  }, 10000)

  let firstAccessToken: string
  let firstRefreshToken: string
  it('should log in user if email is confirmed', async () => {
    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: secondUserData.login,
        password: secondUserData.password
      })
      .expect(HTTP_STATUSES.OK_200)

    expect(result.body.accessToken).not.toBeUndefined()
    const cookies = result.headers['set-cookie']
    const parsedCookies: Array<any> = cookies.map(parse)
    const exampleCookie = parsedCookies.find((cookie) => cookie?.refreshToken)
    expect(exampleCookie?.refreshToken).not.toBeUndefined()
    firstAccessToken = result.body.accessToken
    firstRefreshToken = exampleCookie?.refreshToken
  }, 10000)

  it('should return my data if everything is fine with tokens', async () => {
    const headers = {
      'Authorization': `Bearer ${firstAccessToken}`
    }

    await getRequest()
      .get(`${RouterPaths.auth}/me`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .set(headers)
      .expect(HTTP_STATUSES.OK_200, {
        email: simpleUser.accountData.email,
        login: simpleUser.accountData.login,
        userId: simpleUser.id
      })
  }, 10000)

  it('should not logout the user with incorrect refresh token', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `refreshToken=qwe`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  it('should logout the user with correct refresh token and then do not refresh token with old data', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)

    await getRequest()
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${firstRefreshToken}`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  })

  let nextAccessToken: string
  let nextRefreshToken: string
  it('should refresh token with valid input token', async () => {
    await sleep(1.5)
    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: secondUserData.login,
        password: secondUserData.password
      })
      .expect(HTTP_STATUSES.OK_200)

    const cookies = result.headers['set-cookie']
    const parsedCookies: Array<any> = cookies.map(parse)
    const exampleCookie = parsedCookies.find((cookie) => cookie?.refreshToken)
    const accessToken = result.body.accessToken
    const refreshToken = exampleCookie?.refreshToken

    const headers = {
      'Authorization': `Bearer ${accessToken}`
    }

    const meRes = await getRequest()
      .get(`${RouterPaths.auth}/me`)
      .auth(accessToken, {type: "bearer"})

    expect(meRes.status).toBe(HTTP_STATUSES.OK_200)

    await sleep(1.2)

    const refreshResponse = await getRequest()
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .send()

    expect(refreshResponse.status).toBe(HTTP_STATUSES.OK_200)

    nextAccessToken = refreshResponse.body.accessToken

    const cookiesInstance = refreshResponse.headers['set-cookie']
    const parsedSecondCookies: Array<any> = cookiesInstance.map(parse)
    const secondCookie = parsedSecondCookies.find((cookie) => cookie?.refreshToken)
    nextRefreshToken = secondCookie?.refreshToken

    expect(nextAccessToken).not.toBe(accessToken)
    expect(nextRefreshToken).not.toBe(refreshToken)

    await getRequest()
      .get(`${RouterPaths.auth}/me`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .set(headers)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)

    await getRequest()
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)
  }, 10000)


  it('should log out user with correct token', async () => {
    await sleep(1.5)
    await getRequest()
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `refreshToken=${nextRefreshToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204)
  })

  afterAll(async () => {
    await client.close()
  })
})