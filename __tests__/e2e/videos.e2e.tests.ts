import request from "supertest";
import {app, RouterPaths} from "../../src/app";
import {HTTP_STATUSES} from "../../src/utils";
import {videosTestManager} from "../utils/videosTestManager";
import {AvailableResolutionsEnum} from "../../src/db/db";
import {CreateVideoModel} from "../../src/features/videos/models/CreateVideoModel";

describe('tests for /videos', () => {
  beforeAll(async () => {
    await request(app).delete(`${RouterPaths.testing}/all-data`)
  })

  it('should return status 200 and an empty array', async () => {
    await request(app)
      .get(RouterPaths.video)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  it('shouldn\'t create a new video when availableResolutions is invalid and return error message', async () => {
    const data: any = {
      author: 'author',
      title: 'wggeg',
      availableResolutions: [
        'ed'
      ]
    }

    const {response} = await videosTestManager.createVideo(data, HTTP_STATUSES.BAD_REQUEST_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: "availableResolutions",
          message: "Invalid availableResolutions"
        }
      ]
    })

    await request(app)
      .get(RouterPaths.video)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  it('shouldn\'t create a new video when author and title are invalid and return error message', async () => {
    const data: any = {
      author: 'authorefefwefwefwefwefwefwefwefwefwefwef',
      title: 'fffffffffefefefefefefefewefwefwefwefwefewefwefwegwegwegwefefewfwefwefwefwefwefwefewf',
      availableResolutions: [
        AvailableResolutionsEnum.P240, AvailableResolutionsEnum.P360
      ]
    }

    const {response} = await videosTestManager.createVideo(data, HTTP_STATUSES.BAD_REQUEST_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: "title",
          message: "Invalid title"
        },
        {
          field: "author",
          message: "Invalid author"
        }
      ]
    })

    await request(app)
      .get(RouterPaths.video)
      .expect(HTTP_STATUSES.OK_200, [])
  })

  let createdVideoExternal: any = null
  it('should create a new video with correct input data', async () => {
    const data: CreateVideoModel = {
      title: 'new title',
      author: 'me',
      availableResolutions: [
        AvailableResolutionsEnum.P240
      ]
    }

    const {createdVideo} = await videosTestManager.createVideo(data)

    createdVideoExternal = createdVideo

    await request(app)
      .get(RouterPaths.video)
      .expect(HTTP_STATUSES.OK_200, [createdVideoExternal])
  })

  it('should return the specified video', async () => {
    await request(app)
      .get(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .expect(createdVideoExternal)
  })

  let updateVideoBody: any = {
    author: 'author',
    title: 'new author',
    availableResolutions: [
      AvailableResolutionsEnum.P240
    ]
  }

  it('shouldn\'t modify the video when video id doesn\'t exist', async () => {
    const id = '343443'

    await request(app)
      .put(`${RouterPaths.video}/${id}`)
      .send(updateVideoBody)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it('shouldn\'t modify the video with incorrect input data', async () => {
    updateVideoBody = {
      ...updateVideoBody,
      author: []
    }

    await request(app)
      .put(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .send(updateVideoBody)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { message: 'Invalid author', field: 'author' }
        ]
      })
  })

  it('shouldn\'t modify the video with incorrect minAgeRestriction value', async () => {
    updateVideoBody = {
      ...updateVideoBody,
      author: 'and stiiiiiiiil',
      minAgeRestriction: 2222
    }

    await request(app)
      .put(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .send(updateVideoBody)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { message: 'Invalid minAgeRestriction', field: 'minAgeRestriction' }
        ]
      })
  })

  it('shouldn\'t modify the video with incorrect canBeDownloaded and publicationDate values', async () => {
    updateVideoBody = {
      ...updateVideoBody,
      author: 'and stiiiiiiiil',
      minAgeRestriction: 12,
      canBeDownloaded: [],
      publicationDate: []
    }

    await request(app)
      .put(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .send(updateVideoBody)
      .expect(HTTP_STATUSES.BAD_REQUEST_400, {
        errorsMessages: [
          { message: 'Invalid canBeDownloaded', field: 'canBeDownloaded' },
          { message: 'Invalid publicationDate', field: 'publicationDate' }
        ]
      })
  })

  it('should update the video with correct input data', async () => {
    updateVideoBody = {
      ...updateVideoBody,
      author: 'and stiiiiiiiil',
      minAgeRestriction: 12,
      canBeDownloaded: false,
      publicationDate: '123'
    }

    await request(app)
      .put(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .send(updateVideoBody)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    createdVideoExternal = {
      ...createdVideoExternal,
      ...updateVideoBody
    }
    await request(app)
      .get(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .expect({
        ...createdVideoExternal
      })
  })

  it('should delete the specified video', async () => {
    await request(app)
      .get(RouterPaths.video)
      .expect(HTTP_STATUSES.OK_200, [createdVideoExternal])

    await request(app)
      .delete(`${RouterPaths.video}/${createdVideoExternal?.id}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await request(app)
      .get(RouterPaths.video)
      .expect(HTTP_STATUSES.OK_200, [])
  })
})