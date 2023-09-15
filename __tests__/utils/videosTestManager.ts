import {HTTP_STATUSES, HttpStatusType} from "../../src/utils";
import {app, RouterPaths} from "../../src/app";
import request from "supertest";
import {CreateVideoModel} from "../../src/features/videos/models/CreateVideoModel";

export const videosTestManager = {
  async createVideo(data: CreateVideoModel, expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201) {
    const response = await request(app)
      .post(RouterPaths.video)
      .send(data)
      .expect(expectedStatusCode)

    let createdVideo

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdVideo = response.body

      expect(createdVideo).toEqual({
        id: expect.any(Number),
        author: data.author,
        title: data.title,
        availableResolutions: data.availableResolutions,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: expect.any(String),
        publicationDate: expect.any(String)
      })
    }


    return { response, createdVideo }
  }
}