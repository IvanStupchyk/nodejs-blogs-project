import mongoose, {HydratedDocument} from "mongoose";
import {PostType} from "../dto/postDto";
import {ObjectId} from "mongodb";

export type PostMethodsType = {
  updatePost: (title: string, content: string, shortDescription: string) => void,
}

export type postModelType = mongoose.Model<PostType, {}, PostMethodsType>

type PostModelStaticType = mongoose.Model<PostType> & {
  makeInstance(
    title: string,
    shortDescription: string,
    content: string,
    blogId: ObjectId,
    blogName: string
  ): HydratedDocument<PostType, PostMethodsType>
}

export type postModelFullType = postModelType & PostModelStaticType

export type HydratedPostType = HydratedDocument<PostType, PostMethodsType>