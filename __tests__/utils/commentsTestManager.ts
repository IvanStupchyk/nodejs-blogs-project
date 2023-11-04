import {HTTP_STATUSES, HttpStatusType} from "../../src/utils/utils";
import request from "supertest";
import {app, RouterPaths} from "../../src/app";
import {CreateCommentModel} from "../../src/features/comments/models/CreateCommentModel";
import {ObjectId} from "mongodb";

export const commentsTestManager = {
  async createComment(
    data: CreateCommentModel,
    postId: any,
    token: string,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    userId: ObjectId = new ObjectId(),
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
        likesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: 'None'
        },
        createdAt: expect.any(String)
      })
    }

    return { response, createdComment }
  }
}
