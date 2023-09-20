import request from "supertest";
import {app, RouterPaths} from "../../src/app";

describe('tests for /blogs', () => {
  beforeAll(async () => {
    await request(app).delete(`${RouterPaths.testing}/all-data`)
  })
})