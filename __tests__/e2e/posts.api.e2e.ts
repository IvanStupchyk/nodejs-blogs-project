import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {CreateBlogModel} from "../../src/features/blogs/models/CreateBlogModel";
import {blogsTestManager} from "../utils/blogsTestManager";
import {errorsConstants} from "../../src/constants/errorsContants";
import {BlogType, PostType} from "../../src/db/db";
import {CreatePostModel} from "../../src/features/posts/models/CreatePostModel";
import {postsTestManager} from "../utils/postsTestManager";

const getRequest = () => {
  return request(app)
}

describe('tests for /posts', () => {
  const invalidData: CreatePostModel = {
    title: '',
    content: '',
    blogId: '',
    shortDescription: ''
  }

  let validBlogData: CreateBlogModel = {
    name: 'new name',
    description: 'new description',
    websiteUrl: 'https://www.aaaaa.com'
  }

  let validPostData: CreatePostModel = {
    title: 'title',
    content: 'content',
    blogId: '',
    shortDescription: 'shortDescription'
  }

  beforeAll( async () => {
    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  it('should return 200 and an empty posts array', async () => {
    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  it('should return 404 for not existing post', async () => {
    await getRequest()
      .get(RouterPaths.posts + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('shouldn\'t create a post if the user is not logged in', async () => {
    await postsTestManager.createPost(invalidData, HTTP_STATUSES.UNAUTHORIZED_401, 'sssss')
  })

  it('shouldn\'t create a post if the user sends invalid data', async () => {
    const { response } = await postsTestManager.createPost(invalidData, HTTP_STATUSES.BAD_REQUEST_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: errorsConstants.post.title
        },
        {
          field: 'shortDescription',
          message: errorsConstants.post.shortDescription
        },
        {
          field: 'content',
          message: errorsConstants.post.content
        },
        {
          field: 'blogId',
          message: errorsConstants.post.blogId
        }
      ]
    })

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  let newPost: PostType
  let newBlog: BlogType
  it('shouldn create a post if the user sent valid data with existing blog id', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(validBlogData)

    await getRequest()
      .get(`${RouterPaths.blog}/${createdBlog.id}`)
      .expect(createdBlog)

    validPostData = {
      ...validPostData,
      blogId: createdBlog.id
    }
    const { createdPost } = await postsTestManager.createPost(validPostData, HTTP_STATUSES.CREATED_201)

    newPost = createdPost
    newBlog = createdBlog

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, [createdPost])
  })

  it('shouldn\'t update post if the post doesn\'t exist', async () => {
    await getRequest()
      .put(`${RouterPaths.posts}/22`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(validPostData)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should update a post with valid data', async () => {
    const updatedValidData = {
      ...validPostData,
      title: 'updated title'
    }
    await getRequest()
      .put(`${RouterPaths.posts}/${newPost.id}`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(`${RouterPaths.posts}/${newPost.id}`)
      .expect({
        ...newPost,
        title: updatedValidData.title
      })
  })

  it('shouldn\'t delete a post if it doesn\'t exist', async () => {
    await getRequest()
      .delete(`${RouterPaths.posts}/22`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(validPostData)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should delete a post with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.posts}/${newPost.id}`)
      .auth('admin', 'qwerty', {type: "basic"})
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, [])

    await getRequest()
      .get(RouterPaths.blog)
      .expect(HTTP_STATUSES.OK_200, [newBlog])
  })
})