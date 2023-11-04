import {HTTP_STATUSES, HttpStatusType} from "../../src/utils/utils";
import request from "supertest";
import {app, RouterPaths} from "../../src/app";
import {CreateUserModel} from "../../src/features/users/models/CreateUserModel";

export const usersTestManager = {
  async createUser(
    data: CreateUserModel,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty'
  ) {
    const response = await request(app)
      .post(RouterPaths.users)
      .auth('admin', password, {type: "basic"})
      .send(data)
      .expect(expectedStatusCode)

    let createdUser

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdUser = response.body

      expect(createdUser).toEqual({
        id: expect.any(String),
        login: data.login,
        email: data.email,
        createdAt: expect.any(String)
      })
    }

    return { response, createdUser }
  }
}
