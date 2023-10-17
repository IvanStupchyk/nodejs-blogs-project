import {HTTP_STATUSES, HttpStatusType} from "../../src/utils";
import request from "supertest";
import {app, RouterPaths} from "../../src/app";
import {CreateCommentModel} from "../../src/features/comments/models/CreateCommentModel";

export const commentsTestManager = {
  async createComment(
    data: CreateCommentModel,
    postId: string,
    token: string,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    userId: string = '',
    userLogin: string = ''
  ) {
    const response = await request(app)
      .post(`${RouterPaths.posts}/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(expectedStatusCode)

    let createdComment

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdComment = response.body

      expect(createdComment).toEqual({
        id: expect.any(String),
        content: data.content,
        commentatorInfo: {
          userId,
          userLogin
        },
        createdAt: expect.any(String)
      })
    }

    return { response, createdComment }
  }
}
