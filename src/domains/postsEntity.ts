import mongoose from "mongoose";
import {PostType} from "../dto/postDto";
import {PostModel} from "../db/db";
import {ObjectId} from "mongodb";
import {HydratedPostType} from "../types/postsTypes";

export const postSchema = new mongoose.Schema<PostType>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  shortDescription: {type: String, required: true},
  content: {type: String, required: true},
  blogId: {type: String, required: true},
  createdAt: {type: String, required: true},
  blogName: {type: String, required: true}
})

postSchema.method('updatePost', function updatePost(
  title: string,
  content: string,
  shortDescription: string,
) {
  const that = this as HydratedPostType

  that.content = content
  that.title = title
  that.shortDescription = shortDescription
})

postSchema.static('makeInstance', function makeInstance(
  title: string,
  shortDescription: string,
  content: string,
  blogId: ObjectId,
  blogName: string
) {
  return new PostModel({
    id: new ObjectId(),
    title,
    shortDescription,
    content,
    blogId,
    createdAt: new Date().toISOString(),
    blogName
  })
})
