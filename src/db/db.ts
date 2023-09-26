import {MongoClient} from "mongodb";
import dotenv from "dotenv";
dotenv.config()

export type BlogType = {
  id: string,
  name: string
  description: string
  websiteUrl: string
  createdAt: string
  isMembership: boolean
}

export type BlogsType = Array<BlogType>

export type PostType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  createdAt: string
  blogName: string
}

export type PostsType = Array<PostType>

const mongoUri = process.env.DATABASE_URI ?? ''

export const client = new MongoClient(mongoUri)
export const blogsCollections = client.db().collection<BlogType>('blogs')
export const postsCollections = client.db().collection<PostType>('posts')

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

export let db: DBType = {
  blogs: [
  ],
  posts: [
  ]
}

export type DBType = {
  blogs: Array<BlogType>
  posts: Array<PostType>
}


