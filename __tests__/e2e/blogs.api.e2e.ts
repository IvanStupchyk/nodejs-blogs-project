import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {CreateBlogModel} from "../../src/features/blogs/models/CreateBlogModel";
import {blogsTestManager} from "../utils/blogsTestManager";
import {errorsConstants} from "../../src/constants/errorsContants";
import {BlogType} from "../../src/db/db";

const getRequest = () => {
  return request(app)
}

describe('tests for /blogs', () => {
  const invalidData: CreateBlogModel = {
    name: '',
    description: '',
    websiteUrl: ''
  }

  let validData: CreateBlogModel = {
    name: 'new name',
    description: 'new description',
    websiteUrl: 'https://www.aaaaa.com'
  }

  beforeAll( async () => {
    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  it('should return 200 and an empty blogs array', async () => {
    await getRequest()
      .get(RouterPaths.blog)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  it('should return 404 for not existing blog', async () => {
    await getRequest()
      .get(RouterPaths.blog + '/3423')
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('shouldn\'t create a blog if the user is not logged in', async () => {
    await blogsTestManager.createBlog(invalidData, HTTP_STATUSES.UNAUTHORIZED_401, 'sssss')
  })

  it('shouldn\'t create a blog if the user sends invalid data', async () => {
    const { response } = await blogsTestManager.createBlog(invalidData, HTTP_STATUSES.BAD_REQUEST_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: errorsConstants.blog.name
        },
        {
          field: 'description',
          message: errorsConstants.blog.description
        },
        {
          field: 'websiteUrl',
          message: errorsConstants.blog.websiteUrl
        }
      ]
    })

    await getRequest()
      .get(RouterPaths.blog)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  let newBlog: BlogType
  it('should create a blog if the user sends the valid data', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(validData)

    newBlog = createdBlog

    await getRequest()
      .get(RouterPaths.blog)
      .expect(HTTP_STATUSES.OK_200, [newBlog])
  })

  it('shouldn\'t update a blog if the blog doesn\'t exist', async () => {
    await getRequest()
      .put(`${RouterPaths.blog}/22`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(validData)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should update a blog with valid data', async () => {
    const updatedValidData = {
      ...validData,
      name: 'updated name'
    }
    await getRequest()
      .put(`${RouterPaths.blog}/${newBlog.id}`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(`${RouterPaths.blog}/${newBlog.id}`)
      .expect({
        ...newBlog,
        name: updatedValidData.name
      })
  })

  it('shouldn\'t delete a blog if the blog doesn\'t exist', async () => {
    await getRequest()
      .delete(`${RouterPaths.blog}/22`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(validData)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should delete a blog with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.blog}/${newBlog.id}`)
      .auth('admin', 'qwerty', {type: "basic"})
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(RouterPaths.blog)
      .expect(HTTP_STATUSES.OK_200, [])
  })
})