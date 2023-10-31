import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {mongooseUri} from "../../src/db/db";
import {BlogType, CommentStatus, PostType} from "../../src/types/generalTypes";
import {CreateUserModel} from "../../src/features/users/models/CreateUserModel";
import {usersTestManager} from "../utils/usersTestManager";
import {LoginUserModel} from "../../src/features/auth/models/LoginUserModel";
import {CreateCommentModel} from "../../src/features/comments/models/CreateCommentModel";
import {blogsTestManager} from "../utils/blogsTestManager";
import {postsTestManager} from "../utils/postsTestManager";
import {commentsTestManager} from "../utils/commentsTestManager";
import {CommentViewModel} from "../../src/features/comments/models/CommentViewModel";
import {UpdateCommentModel} from "../../src/features/comments/models/UpdateCommentModel";
import {ViewUserModel} from "../../src/features/users/models/ViewUserModel";
import mongoose from "mongoose";

const getRequest = () => {
  return request(app)
}

const sleep = (seconds: number) => new Promise((r) => setTimeout(r, seconds * 1000))

describe('tests for /comments and posts/:id/comments', () => {
  const invalidCommentData: CreateCommentModel = {
    content: ''
  }

  let validCommentData: CreateCommentModel = {
    content: 'new comment for existing comment'
  }

  const userData1: CreateUserModel = {
    login: 'Ivan',
    password: '123456',
    email: 'ivanIvan@gmail.com'
  }

  const userData2 = {
    login: 'Sergey',
    password: '123456',
    email: 'ser@gmail.com'
  }

  const userData3 = {
    login: 'Andrey',
    password: '123456',
    email: 'ser@gmail.com'
  }

  beforeAll( async () => {
    await mongoose.connect(mongooseUri)
    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  let newPost: PostType
  let newBlog: BlogType
  let user1: ViewUserModel
  let user2: ViewUserModel
  let user3: ViewUserModel
  let comment1: CommentViewModel
  let comment2: CommentViewModel
  let comment3: CommentViewModel
  let newComments: Array<CommentViewModel> = []
  let accessTokenUser1: string
  let accessTokenUser2: string
  let accessTokenUser3: string

  it('should create a user with correct credentials for future tests', async () => {
    const { createdUser } = await usersTestManager.createUser(userData1)
    const secondUserData = await usersTestManager.createUser(userData2)
    const thirdUserData = await usersTestManager.createUser(userData3)

    user1 = createdUser
    user2 = secondUserData.createdUser
    user3 = thirdUserData.createdUser

    await getRequest()
      .get(RouterPaths.users)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [thirdUserData.createdUser, secondUserData.createdUser, createdUser]
      })
  })

  it('should log in a user with correct credentials and return access token', async () => {
    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData1.login,
        password: userData1.password
      })
      .expect(HTTP_STATUSES.OK_200)

    const result2 = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData2.login,
        password: userData2.password
      })
      .expect(HTTP_STATUSES.OK_200)

    const result3 = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: userData3.login,
        password: userData3.password
      })
      .expect(HTTP_STATUSES.OK_200)

    expect(result.body.accessToken).toEqual(expect.any(String))

    accessTokenUser1 = result.body.accessToken
    accessTokenUser2 = result2.body.accessToken
    accessTokenUser3 = result3.body.accessToken
  }, 10000)

  it('should create post if the user sent valid data with existing blog id', async () => {
    const { createdBlog } = await blogsTestManager.createBlog({
      name: 'new name',
      description: 'new description',
      websiteUrl: 'https://www.aaaaa.com'
    })

    await getRequest()
      .get(`${RouterPaths.blogs}/${createdBlog.id}`)
      .expect(createdBlog)

    const validPostData = {
      title: 'title',
      content: 'content',
      blogId: createdBlog.id,
      shortDescription: 'shortDescription'
    }

    const { createdPost } = await postsTestManager.createPost(validPostData, HTTP_STATUSES.CREATED_201)

    newPost = createdPost
    newBlog = createdBlog

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost]
      })
  })

  it('shouldn\'t create a new comment if user is not authorized', async () => {
    await commentsTestManager
      .createComment(invalidCommentData, '12', 'aaaa', HTTP_STATUSES.UNAUTHORIZED_401)
  })

  it('shouldn\'t create a new comment with wrong payload', async () => {
    await commentsTestManager
      .createComment(invalidCommentData, '12', accessTokenUser1, HTTP_STATUSES.BAD_REQUEST_400)
  })

  it('shouldn\'t create a new comment for non-existent post', async () => {
    await commentsTestManager
      .createComment(validCommentData, '12', accessTokenUser1, HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should create a new comment for existing post', async () => {
    const {createdComment} = await commentsTestManager.createComment(
      validCommentData,
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login
    )

    comment1 = createdComment
    newComments.push(createdComment)
  })

  it('should return correctly filtered and sorted comments', async () => {
    const pageNumber = 2
    const pageSize = 2

    const secondComment = await commentsTestManager.createComment(
      {
        ...validCommentData,
        content: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      },
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login
    )

    const thirdComment = await commentsTestManager.createComment(
      {
        ...validCommentData,
        content: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
      },
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login
    )

    const fourthComment = await commentsTestManager.createComment(
      {
        ...validCommentData,
        content: 'cccccccccccccccccccccccccccccccc'
      },
      newPost.id,
      accessTokenUser1,
      HTTP_STATUSES.CREATED_201,
      user1.id,
      user1.login
    )

    newComments.unshift(secondComment.createdComment)
    comment2 = secondComment.createdComment
    newComments.unshift(thirdComment.createdComment)
    comment3 = thirdComment.createdComment
    newComments.unshift(fourthComment.createdComment)

    const sortedComments = [...newComments]
      .sort((a,b) => a.content.localeCompare(b.content))
      .slice((pageNumber - 1) * pageSize, (pageNumber - 1) * pageSize + pageSize)

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newComments.length,
        items: newComments
      })

    await getRequest()
      .get(
        `${RouterPaths.posts}/${newPost.id}/comments?sortBy=content&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`
      )
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newComments.length,
        items: sortedComments
      })
  }, 10000)

  it('should return 404 status code if comment doesn\'t exist', async () => {
    await getRequest()
      .get(`${RouterPaths.comments}/123`)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should return current comment', async () => {
    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .expect(HTTP_STATUSES.OK_200, comment1)
  })

  it('should return 403 status if user tries to update someone else\'s comment', async () => {
    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: userData2.login,
      password: userData2.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .send({content: 'second new content for updated comment'})
      .expect(HTTP_STATUSES.FORBIDDEN_403)

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .expect(HTTP_STATUSES.OK_200, comment1)
  })

  it('should not like comment with incorrect input data', async () => {
    const updateLike = {
      likeStatus: 'ssss'
    }

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { field: 'likeStatus', message: 'Incorrect like status' }
        ]
      })
  })

  it('should like comment with correct input data', async () => {
    const updateLike = {
      likeStatus: CommentStatus.Like
    }

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    comment1.likesInfo.likesCount = 1
    comment1.likesInfo.myStatus = updateLike.likeStatus

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1)
  })

  it('should dislike comment with correct input data', async () => {
    const updateLike = {
      likeStatus: CommentStatus.Dislike
    }

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    comment1.likesInfo.likesCount = 0
    comment1.likesInfo.dislikesCount = 1
    comment1.likesInfo.myStatus = updateLike.likeStatus

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1)
  })

  it('should reset likes and dislikes', async () => {
    const updateLike = {
      likeStatus: CommentStatus.None
    }

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    comment1.likesInfo.likesCount = 0
    comment1.likesInfo.dislikesCount = 0
    comment1.likesInfo.myStatus = updateLike.likeStatus

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1)
  })

  it('should like first comment by user 1 then like by user 2 two times and dislike by user 3', async () => {
    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send({
        likeStatus: CommentStatus.Like
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        likeStatus: CommentStatus.Like
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        likeStatus: CommentStatus.Like
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser3}`)
      .send({
        likeStatus: CommentStatus.Dislike
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    comment1.likesInfo.likesCount = 2
    comment1.likesInfo.dislikesCount = 1
    comment1.likesInfo.myStatus = CommentStatus.Like

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, comment1)

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .expect(HTTP_STATUSES.OK_200, {
        ...comment1,
        likesInfo: {
          ...comment1.likesInfo,
          myStatus: 'None'
        }
      })

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newComments.length,
        items: newComments
      })

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newComments.length,
        items: newComments.map(c => {
          return {
            ...c,
            likesInfo: {
              ...c.likesInfo,
              myStatus: 'None'
            }
          }
        })
      })
  }, 10000)

  it('should update current comment', async () => {
    const newCommentContent: UpdateCommentModel = {
      content: 'new content for updated comment'
    }
    await getRequest()
      .put(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(newCommentContent)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200, {
        ...comment1,
        ...newCommentContent
      })
  })

  it('shouldn\'t delete someone else\'s comment', async () => {
    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: userData2.login,
      password: userData2.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    await getRequest()
      .delete(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .expect(HTTP_STATUSES.FORBIDDEN_403)
  })

  it('should delete certain comment', async () => {
    await sleep(10)
    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: userData1.login,
      password: userData1.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    await getRequest()
      .delete(`${RouterPaths.comments}/${comment1.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const filteredComments = newComments.filter(c => c.id !== comment1.id)

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: filteredComments.length,
        items: filteredComments
      })
  }, 14000)
})