import mongoose from "mongoose";
import {PostType} from "../dto/postDto";
import {PostModel} from "../db/db";
import {ObjectId} from "mongodb";

export const postSchema = new mongoose.Schema<PostType>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  shortDescription: {type: String, required: true},
  content: {type: String, required: true},
  blogId: {type: String, required: true},
  createdAt: {type: String, required: true},
  blogName: {type: String, required: true}
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
