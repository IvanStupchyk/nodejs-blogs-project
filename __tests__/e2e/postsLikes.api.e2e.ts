import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils/utils";
import {CreateBlogModel} from "../../src/features/blogs/models/CreateBlogModel";
import {blogsTestManager} from "../utils/blogsTestManager";
import {mongooseUri} from "../../src/db/db";
import {CreatePostModel} from "../../src/features/posts/models/CreatePostModel";
import {postsTestManager} from "../utils/postsTestManager";
import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import {PostType} from "../../src/dto/postDto";
import {BlogType} from "../../src/domains/blogs/dto/createBlogDto";
import {ViewUserModel} from "../../src/features/users/models/ViewUserModel";
import {PostViewModel} from "../../src/features/posts/models/PostViewModel";
import {CreateUserModel} from "../../src/features/users/models/CreateUserModel";
import {usersTestManager} from "../utils/usersTestManager";
import {CommentStatus} from "../../src/types/generalTypes";

const getRequest = () => {
  return request(app)
}

describe('tests for /posts with likes logic', () => {
  let blogData: CreateBlogModel = {
    name: 'new name',
    description: 'new description',
    websiteUrl: 'https://www.aaaaa.com'
  }

  let validPostData: CreatePostModel = {
    title: 'title',
    content: 'content',
    blogId: new ObjectId(),
    shortDescription: 'shortDescription'
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

  let newBlog: BlogType
  let user1: ViewUserModel
  let user2: ViewUserModel
  let user3: ViewUserModel
  let post1: PostViewModel
  let post2: PostType
  let post3: PostType
  let post4: PostType
  let accessTokenUser1: string
  let accessTokenUser2: string
  let accessTokenUser3: string
  let newPosts: Array<PostType> = []

  it('should create users with for future tests', async () => {
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

  it('should create posts for future tests', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(blogData)

    await getRequest()
      .get(`${RouterPaths.blogs}/${createdBlog.id}`)
      .expect(createdBlog)

    validPostData = {
      ...validPostData,
      blogId: createdBlog.id
    }

    const { createdPost } = await postsTestManager.createPost(validPostData, HTTP_STATUSES.CREATED_201)
    const createdPost2 = await postsTestManager.createPost({
      title: 'a',
      content: 'content',
      blogId: createdBlog.id,
      shortDescription: 'shortDescription'
    }, HTTP_STATUSES.CREATED_201)
    const createdPost3 = await postsTestManager.createPost({
      title: 'b',
      content: 'content',
      blogId: createdBlog.id,
      shortDescription: 'shortDescription'
    }, HTTP_STATUSES.CREATED_201)
    const createdPost4 = await postsTestManager.createPost({
      title: 'c',
      content: 'content',
      blogId: createdBlog.id,
      shortDescription: 'shortDescription'
    }, HTTP_STATUSES.CREATED_201)

    post1 = createdPost
    post2 = createdPost2.createdPost
    post3 = createdPost3.createdPost
    post4 = createdPost4.createdPost

    newBlog = createdBlog
    newPosts.push(post4)
    newPosts.push(post3)
    newPosts.push(post2)
    newPosts.push(post1)

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: newPosts.length,
        items: [...newPosts]
      })
  })

  it('should log in users with correct credentials and return access token', async () => {
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


  it('should not like post with incorrect input data', async () => {
    const updateLike = {
      likeStatus: 'ssss'
    }

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { field: 'likeStatus', message: 'Incorrect like status' }
        ]
      })
  })

  it('should like post with correct input data', async () => {
    const updateLike = {
      likeStatus: CommentStatus.Like
    }

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    post1.extendedLikesInfo.likesCount = 1
    post1.extendedLikesInfo.myStatus = CommentStatus.Like

    const res = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [{
          addedAt: expect.any(String),
          userId: user1.id,
          login: user1.login
        }]
      }
    })
  })

  it('should dislike post with correct input data', async () => {
    const updateLike = {
      likeStatus: CommentStatus.Dislike
    }

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    post1.extendedLikesInfo.dislikesCount = 1
    post1.extendedLikesInfo.likesCount = 0
    post1.extendedLikesInfo.myStatus = CommentStatus.Dislike

    const res = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: []
      }
    })
  })

  it('should like post by user2 then set none value then like by user1 and user2', async () => {
    const updateLike = {
      likeStatus: CommentStatus.Like
    }

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    post1.extendedLikesInfo.likesCount = ++post1.extendedLikesInfo.likesCount
    post1.extendedLikesInfo.myStatus = CommentStatus.Like

    const res1 = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res1.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [{
          addedAt: expect.any(String),
          userId: user2.id,
          login: user2.login
        }]
      }
    })

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send({
        likeStatus: CommentStatus.None
      })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    post1.extendedLikesInfo.likesCount = --post1.extendedLikesInfo.likesCount
    post1.extendedLikesInfo.myStatus = CommentStatus.None

    const res2 = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res2.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: []
      }
    })

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser1}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .put(`${RouterPaths.posts}/${post1.id}/like-status`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .send(updateLike)
      .expect(HTTP_STATUSES.NO_CONTENT_204)


    post1.extendedLikesInfo.likesCount = 2
    post1.extendedLikesInfo.dislikesCount = 0
    post1.extendedLikesInfo.myStatus = CommentStatus.Like

    const res3 = await getRequest()
      .get(`${RouterPaths.posts}/${post1.id}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res3.body).toEqual({
      ...post1,
      extendedLikesInfo: {
        ...post1.extendedLikesInfo,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: user2.id,
            login: user2.login
          },
          {
            addedAt: expect.any(String),
            userId: user1.id,
            login: user1.login
          }
        ]
      }
    })
  })

  it('should return all posts', async () => {
    const res = await getRequest()
      .get(`${RouterPaths.posts}`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login
              }
            ]
          }
        }
      ]
    })

    const res2 = await getRequest()
      .get(`${RouterPaths.posts}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res2.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            myStatus: CommentStatus.None,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login
              }
            ]
          }
        }
      ]
    })
  })

  it('should return all posts for specified blog', async () => {
    const res = await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}/posts`)
      .set('Authorization', `Bearer ${accessTokenUser2}`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login
              }
            ]
          }
        }
      ]
    })

    const res2 = await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}/posts`)
      .expect(HTTP_STATUSES.OK_200)

    expect(res2.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        post4,
        post3,
        post2,
        {
          ...post1,
          extendedLikesInfo: {
            ...post1.extendedLikesInfo,
            myStatus: CommentStatus.None,
            newestLikes: [
              {
                addedAt: expect.any(String),
                userId: user2.id,
                login: user2.login
              },
              {
                addedAt: expect.any(String),
                userId: user1.id,
                login: user1.login
              }
            ]
          }
        }
      ]
    })
  })
})