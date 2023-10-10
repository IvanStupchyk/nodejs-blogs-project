import {app, RouterPaths} from "../../src/app";
import request from 'supertest'
import {HTTP_STATUSES} from "../../src/utils";
import {CreateBlogModel} from "../../src/features/blogs/models/CreateBlogModel";
import {blogsTestManager} from "../utils/blogsTestManager";
import {errorsConstants} from "../../src/constants/errorsContants";
import {client} from "../../src/db/db";
import {mockBlogs} from "../../src/constants/blanks";
import {postsTestManager} from "../utils/postsTestManager";
import {CreatePostModel} from "../../src/features/posts/models/CreatePostModel";
import {BlogType, PostType} from "../../src/types/generalTypes";

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

  let validPostData: CreatePostModel = {
    title: 'title',
    content: 'content',
    blogId: '',
    shortDescription: 'shortDescription'
  }

  beforeAll( async () => {
    await client.connect()
    await getRequest().delete(`${RouterPaths.testing}/all-data`)
  })

  let newBlogs: Array<BlogType> = []

  it('should return 200 and an empty blogs array', async () => {
    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, mockBlogs)
  })

  it('should return 404 for not existing blog', async () => {
    await getRequest()
      .get(RouterPaths.blogs + '/3423')
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
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, mockBlogs)
  })

  let newBlog: BlogType
  let newPost: PostType
  let secondPost: PostType
  it('should create a blog if the user sends the valid data', async () => {
    const { createdBlog } = await blogsTestManager.createBlog(validData)

    newBlog = createdBlog
    newBlogs.push(createdBlog)

    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdBlog]
      })
  })

  it('should return all posts for specified blog', async () => {
    validPostData = {
      ...validPostData,
      blogId: newBlog.id
    }
    const { createdPost } = await postsTestManager.createPost(validPostData, HTTP_STATUSES.CREATED_201)

    newPost = createdPost

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost]
      })

    await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}/posts`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdPost]
      })
  })

  it('should return correctly filtered and sorted blogs', async () => {
    const pageNumber = 2
    const pageSize = 2

    const secondBlog = await blogsTestManager.createBlog(
      {...validData, name: 'second', description: 'a'}
    )

    const thirdBlog = await blogsTestManager.createBlog(
      {...validData, name: 'third', description: 'b'}
    )

    const fourthBlog = await blogsTestManager.createBlog(
      {...validData, name: 'fourth', description: 'c'}
    )

    newBlogs.unshift(secondBlog.createdBlog)
    newBlogs.unshift(thirdBlog.createdBlog)
    newBlogs.unshift(fourthBlog.createdBlog)

    const sortedBlogs = [...newBlogs]
      .sort((a,b) => a.name.localeCompare(b.name))
      .slice((pageNumber - 1) * pageSize, (pageNumber - 1) * pageSize + pageSize)

    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: newBlogs
      })

    await getRequest()
      .get(`${RouterPaths.blogs}?searchNameTerm=second`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [secondBlog.createdBlog]
      })

    await getRequest()
      .get(
        `${RouterPaths.blogs}?sortBy=name&sortDirection=asc&pageSize=${pageSize}&pageNumber=${pageNumber}`
      )
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 2,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: newBlogs.length,
        items: sortedBlogs
      })
  })

  it('should create a new post for specific blog', async () => {
    validPostData = {
      ...validPostData,
      blogId: newBlog.id
    }
    const { createdPost } = await postsTestManager
      .createPostForSpecifiedBlog({...validPostData, title: 'second'}, newBlog.id, HTTP_STATUSES.CREATED_201)

    secondPost = createdPost

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPost, newPost]
      })

    await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}/posts`)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [createdPost, newPost]
      })
  })

  it('shouldn\'t create a post if blog doesn\'t exist', async () => {
    await postsTestManager.createPostForSpecifiedBlog(validPostData, '333', HTTP_STATUSES.NOT_FOUND_404)

    await getRequest()
      .get(RouterPaths.posts)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [secondPost, newPost]
      })
  })

  it('shouldn\'t update a blog if the blog doesn\'t exist', async () => {
    await getRequest()
      .put(`${RouterPaths.blogs}/22`)
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
      .put(`${RouterPaths.blogs}/${newBlog.id}`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(updatedValidData)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await getRequest()
      .get(`${RouterPaths.blogs}/${newBlog.id}`)
      .expect({
        ...newBlog,
        name: updatedValidData.name
      })
  })

  it('shouldn\'t delete a blog if the blog doesn\'t exist', async () => {
    await getRequest()
      .delete(`${RouterPaths.blogs}/22`)
      .auth('admin', 'qwerty', {type: "basic"})
      .send(validData)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('should delete a blog with exiting id', async () => {
    await getRequest()
      .delete(`${RouterPaths.blogs}/${newBlog.id}`)
      .auth('admin', 'qwerty', {type: "basic"})
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    const filteredBlogs = newBlogs.filter(b => b.id !== newBlog.id)

    await getRequest()
      .get(RouterPaths.blogs)
      .expect(HTTP_STATUSES.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: filteredBlogs.length,
        items: filteredBlogs
      })
  })

  afterAll(async () => {
    await client.close()
  })
})