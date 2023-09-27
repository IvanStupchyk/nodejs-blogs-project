import {CreateBlogModel} from "../../src/features/blogs/models/CreateBlogModel";
import {HTTP_STATUSES, HttpStatusType} from "../../src/utils";
import request from "supertest";
import {app, RouterPaths} from "../../src/app";

export const blogsTestManager = {
  async createBlog(
    data: CreateBlogModel,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty'
  ) {
    const response = await request(app)
      .post(RouterPaths.blog)
      .auth('admin', password, {type: "basic"})
      .send(data)
      .expect(expectedStatusCode)

    let createdBlog

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdBlog = response.body

      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      })
    }

    return { response, createdBlog }
  }
}
