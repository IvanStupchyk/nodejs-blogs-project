import {HTTP_STATUSES, HttpStatusType} from "../../src/utils/utils";
import request from "supertest";
import {app, RouterPaths} from "../../src/app";
import {CreatePostModel} from "../../src/features/posts/models/CreatePostModel";
import {likeStatus} from "../../src/types/generalTypes";

export const postsTestManager = {
  async createPost(
    data: any,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty'
  ) {
    const response = await request(app)
      .post(RouterPaths.posts)
      .auth('admin', password, {type: "basic"})
      .send(data)
      .expect(expectedStatusCode)

    let createdPost

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdPost = response.body

      expect(createdPost).toEqual({
        id: expect.any(String),
        title: data.title,
        content: data.content,
        shortDescription: data.shortDescription,
        blogId: data.blogId,
        createdAt: expect.any(String),
        blogName: createdPost.blogName,
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: likeStatus.None,
          newestLikes: []
        }
      })
    }

    return { response, createdPost }
  },

  async createPostForSpecifiedBlog(
    data: CreatePostModel,
    blogId: any,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty'
  ) {
    const response = await request(app)
      .post(`${RouterPaths.blogs}/${blogId}/posts`)
      .auth('admin', password, {type: "basic"})
      .send(data)
      .expect(expectedStatusCode)

    let createdPost

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdPost = response.body

      expect(createdPost).toEqual({
        id: expect.any(String),
        title: data.title,
        content: data.content,
        shortDescription: data.shortDescription,
        blogId: data.blogId,
        createdAt: expect.any(String),
        blogName: createdPost.blogName,
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: likeStatus.None,
          newestLikes: []
        }
      })
    }

    return { response, createdPost }
  }
}
