import dotenv from "dotenv";
import * as mongoose from 'mongoose'
import {blogSchema} from "../domains/blogs/entities/blogSchema";
import {deviceSchema} from "../domains/devices/entities/deviceSchema";
import {commentSchema} from "../domains/comments/entities/commentSchema";
import {apiRequestSchema} from "../schemas/apiRequestSchema";
import {UserType} from "../dto/userDto";
import {userSchema} from "../domains/usersEntity";
import {UserModelFullType} from "../types/usersTypes";
import {postSchema} from "../domains/postsEntity";
import {PostType} from "../dto/postDto";
import {postModelFullType} from "../types/postsTypes";

dotenv.config()

export const mongooseUri = process.env.DATABASE_MONGOOSE_URI ?? ''

export const BlogModel = mongoose.model('blogs', blogSchema)
export const PostModel = mongoose.model<PostType, postModelFullType>('posts', postSchema)
export const UserModel = mongoose.model<UserType, UserModelFullType>('users', userSchema)
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