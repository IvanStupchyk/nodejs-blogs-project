import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import {BlogType, CommentType, PostType, UserType} from "../types/generalTypes";
dotenv.config()

const mongoUri = process.env.DATABASE_URI ?? ''

export const client = new MongoClient(mongoUri)
export const blogsCollections = client.db().collection<BlogType>('blogs')
export const postsCollections = client.db().collection<PostType>('posts')
export const usersCollections = client.db().collection<UserType>('users')
export const commentsCollections = client.db().collection<CommentType>('comments')

export async function runDb () {
  try {
    await client.connect()

    await client.db().command({ ping: 1})
    console.log('Connected successfully to mongo sever')
  } catch {
    console.log('Can\'t connect to db')
    await client.close()
  }
}