import express from 'express'
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {blogRouter} from "./features/blogs/blogs.router";
import {resetDBRouterRouter} from "./features/testing/resetDBRouter.router";
import {postRouter} from "./features/posts/posts.router";
import {userRouter} from "./features/users/users.router";
import {authRouter} from "./features/auth/auth.router";
import {commentsRouter} from "./features/comments/comments.router";
import cookieParser from "cookie-parser";
import {devicesRouter} from "./features/devices/devices.router";

export const app = express()
dotenv.config()
app.set('trust proxy', true)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

export const RouterPaths = {
  blogs: '/blogs',
  posts: '/posts',
  users: '/users',
  auth: '/auth',
  comments: '/comments',
  security: '/security',
  testing: '/testing'
}

app.use(RouterPaths.blogs, blogRouter())
app.use(RouterPaths.posts, postRouter())
app.use(RouterPaths.users, userRouter())
app.use(RouterPaths.auth, authRouter())
app.use(RouterPaths.comments, commentsRouter())
app.use(RouterPaths.security, devicesRouter())
app.use(RouterPaths.testing, resetDBRouterRouter())