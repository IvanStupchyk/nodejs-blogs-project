import express from 'express'
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {db} from "./db/db";
import {getBlogRouter} from "./features/blogs/blogs.router";
import {resetDBRouterRouter} from "./features/testing/resetDBRouter.router";
import {getPostRouter} from "./features/posts/posts.router";

export const app = express()
dotenv.config()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

export const RouterPaths = {
  blog: '/blogs',
  posts: '/posts',
  testing: '/testing'
}

app.use(RouterPaths.blog, getBlogRouter(db))
app.use(RouterPaths.posts, getPostRouter(db))
app.use(RouterPaths.testing, resetDBRouterRouter(db))