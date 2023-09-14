import express from 'express'
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {db} from "./db/db";
import {getVideosRouter} from "./features/videos/videos.router";
import {resetDBRouterRouter} from "./features/videos/resetDBRouter.router";

export const app = express()
dotenv.config()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

export const RouterPaths = {
  video: '/videos',
  testing: '/testing'
}

app.use(RouterPaths.video, getVideosRouter(db))
app.use(RouterPaths.testing, resetDBRouterRouter(db))