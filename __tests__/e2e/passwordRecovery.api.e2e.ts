import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {client} from "../../src/db/db";
import {CreateUserModel} from "../../src/features/users/models/CreateUserModel";
import {usersTestManager} from "../utils/usersTestManager";
import {ViewUserModel} from "../../src/features/users/models/ViewUserModel";
import {UserType} from "../../src/types/generalTypes";
import {emailManager} from "../../src/managers/emailManager";
import {jwtService} from "../../src/application/jwt-service";


const getRequest = () => {
  return request(app)
}

describe('tests for /auth password recovery', () => {
  let userData: CreateUserModel = {
    login: 'Nick',
    password: '123456',
    email: 'nickNick@gmail.com'
  }

  beforeAll( async () => {
    await client.connect()

    jest.mock('../../src/managers/emailManager')

    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  let superAdminUser: ViewUserModel

  it('should create user for future tests', async () => {
    const { createdUser } = await usersTestManager.createUser(userData)

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

  it('should not send password recovery code if email is invalid or does not exist in the system', async () => {
    emailManager.sendPasswordRecoveryMessage = jest.fn()

    await getRequest()
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({
        email: 'fefef'
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'email',
            message: 'Incorrect email format'
          }
        ]
      })

    await getRequest()
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({
        email: 'heyhey@gmail.com'
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    expect(emailManager.sendPasswordRecoveryMessage).not.toHaveBeenCalled()
  })

  it('should send password recovery code if email is valid', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({
        email: userData.email
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    expect(emailManager.sendPasswordRecoveryMessage).toHaveBeenCalledTimes(1)
  })

  it('should generate an error if input data is incorrect for new password breakpoint', async () => {
    await getRequest()
      .post(`${RouterPaths.auth}/new-password`)
      .send({
        newPassword: '1234',
        recoveryCode: '111'
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          {
            field: 'newPassword',
            message: 'Wrong password length'
          },
          {
            field: 'recoveryCode',
            message: 'recovery code is incorrect'
          }
        ]
      })
  })

  it('should change user password and log in with new credentials', async () => {
    emailManager.sendPasswordRecoveryMessage = jest.fn()

    const userMock: UserType = {
      id: superAdminUser.id,
      accountData: {
        login: superAdminUser.login,
        passwordHash: '',
        createdAt: superAdminUser.createdAt,
        email: superAdminUser.email
      },
      emailConfirmation: {
        confirmationCode: 'string',
        expirationDate: new Date(),
        isConfirmed: true
      }
    }
    const recoveryCode = await jwtService.createPasswordRecoveryJWT(superAdminUser.id)
    const newPassword = '777777'

    await emailManager.sendPasswordRecoveryMessage(userMock, recoveryCode)

    await getRequest()
      .post(`${RouterPaths.auth}/new-password`)
      .send({
        newPassword,
        recoveryCode
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData.login,
        password: userData.password
      })
      .expect(HTTP_STATUSES.UNAUTHORIZED_401)

    await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData.login,
        password: newPassword
      })
      .expect(HTTP_STATUSES.OK_200)
  })

  afterAll(async () => {
    await client.close()
  })
})