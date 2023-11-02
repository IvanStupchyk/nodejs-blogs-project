import dotenv from "dotenv";
import * as mongoose from 'mongoose'
import {blogSchema} from "../domains/blogs/entities/blogSchema";
import {postSchema} from "../domains/posts/entities/postSchema";
import {deviceSchema} from "../domains/devices/entities/deviceSchema";
import {commentSchema} from "../domains/comments/entities/commentSchema";
import {userSchema} from "../domains/users/entities/userSchema";
import {apiRequestSchema} from "../domains/auth/entities/apiRequestSchema";

dotenv.config()

export const mongooseUri = process.env.DATABASE_MONGOOSE_URI ?? ''

export const BlogModel = mongoose.model('blogs', blogSchema)
export const PostModel = mongoose.model('posts', postSchema)
export const UserModel = mongoose.model('users', userSchema)
export const CommentModel = mongoose.model('comments', commentSchema)
export const DeviceModel = mongoose.model('devices', deviceSchema)
export const ApiRequestModel = mongoose.model('requests', apiRequestSchema)

export async function runDb () {
  try {
    await mongoose.connect(mongooseUri)
    console.log('Connected successfully to mongo sever')
  } catch {
    console.log('Can\'t connect to db')
    await mongoose.disconnect()
  }
}