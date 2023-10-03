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

export const mockBlogModel = {
  id: '',
  name: '',
  description: '',
  websiteUrl: '',
  createdAt: '',
  isMembership: false
}

export const mockPostModel = {
  id: '',
  title: '',
  shortDescription: '',
  content: '',
  blogId: '',
  createdAt: '',
  blogName: ''
}

export type BlogsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<BlogType>
}

export type PostType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  createdAt: string
  blogName: string
}

export type PostsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<PostType>
}

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