import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {client} from "../../src/db/db";
import {BlogType, CommentType, PostType} from "../../src/types/generalTypes";
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

const getRequest = () => {
  return request(app)
}

describe('tests for /comments and posts/:id/comments', () => {
  const invalidCommentData: CreateCommentModel = {
    content: ''
  }

  let validCommentData: CreateCommentModel = {
    content: 'new comment for existing comment'
  }

  const userData: CreateUserModel = {
    login: 'Ivan',
    password: '123456',
    email: 'ivanIvan@gmail.com'
  }

  beforeAll( async () => {
    await client.connect()
    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  afterAll(async () => {
    await client.close()
  })

  let newPost: PostType
  let newBlog: BlogType
  let newUser: ViewUserModel
  let newComment: CommentType
  let newComments: Array<CommentViewModel> = []
  let accessToken: string

  it('should create a user with correct credentials for future tests', async () => {
    const { createdUser } = await usersTestManager.createUser(userData)

    newUser = createdUser

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

  it('should log in a user with correct credentials and return access token', async () => {
    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: newUser.login,
      password: userData.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    expect(result.body.accessToken).toEqual(expect.any(String))

    accessToken = result.body.accessToken
  })

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
      .createComment(invalidCommentData, '12', accessToken, HTTP_STATUSES.BAD_REQUEST_400)
  })

  it('shouldn\'t create a new comment for non-existent post', async () => {
    await commentsTestManager
      .createComment(validCommentData, '12', accessToken, HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should create a new comment for non-existent post', async () => {
    const {createdComment} = await commentsTestManager.createComment(
      validCommentData,
      newPost.id,
      accessToken,
      HTTP_STATUSES.CREATED_201,
      newUser.id,
      newUser.login
    )

    newComment = createdComment
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
      accessToken,
      HTTP_STATUSES.CREATED_201,
      newUser.id,
      newUser.login
    )

    const thirdComment = await commentsTestManager.createComment(
      {
        ...validCommentData,
        content: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
      },
      newPost.id,
      accessToken,
      HTTP_STATUSES.CREATED_201,
      newUser.id,
      newUser.login
    )

    const fourthComment = await commentsTestManager.createComment(
      {
        ...validCommentData,
        content: 'cccccccccccccccccccccccccccccccc'
      },
      newPost.id,
      accessToken,
      HTTP_STATUSES.CREATED_201,
      newUser.id,
      newUser.login
    )

    newComments.unshift(secondComment.createdComment)
    newComments.unshift(thirdComment.createdComment)
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
      .get(`${RouterPaths.comments}/${newComment.id}`)
      .expect(HTTP_STATUSES.OK_200, newComment)
  })

  const secondUser = {
    login: 'Sergey',
    password: '123456',
    email: 'ser@gmail.com'
  }
  it('should return 403 status if user tries to update someone else\'s comment', async () => {
    await usersTestManager.createUser(secondUser)

    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: secondUser.login,
      password: secondUser.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    await getRequest()
      .put(`${RouterPaths.comments}/${newComment.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .send({content: 'second new content for updated comment'})
      .expect(HTTP_STATUSES.FORBIDDEN_403)

    await getRequest()
      .get(`${RouterPaths.comments}/${newComment.id}`)
      .expect(HTTP_STATUSES.OK_200, newComment)
  })

  it('should update current comment', async () => {
    const newCommentContent: UpdateCommentModel = {
      content: 'new content for updated comment'
    }
    await getRequest()
      .put(`${RouterPaths.comments}/${newComment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newCommentContent)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(`${RouterPaths.comments}/${newComment.id}`)
      .expect(HTTP_STATUSES.OK_200, {
        ...newComment,
        ...newCommentContent
      })
  })

  it('shouldn\'t delete someone else\'s comment', async () => {
    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: secondUser.login,
      password: secondUser.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    await getRequest()
      .delete(`${RouterPaths.comments}/${newComment.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .expect(HTTP_STATUSES.FORBIDDEN_403)
  })

  it('should delete certain comment', async () => {
    const userWithCorrectData: LoginUserModel = {
      loginOrEmail: userData.login,
      password: userData.password
    }

    const result = await getRequest()
      .post(`${RouterPaths.auth}/login`)
      .send(userWithCorrectData)
      .expect(HTTP_STATUSES.OK_200)

    await getRequest()
      .delete(`${RouterPaths.comments}/${newComment.id}`)
      .set('Authorization', `Bearer ${result.body.accessToken}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const filteredComments = newComments.filter(c => c.id !== newComment.id)

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}/comments`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: filteredComments.length,
        items: filteredComments
      })
  })
})