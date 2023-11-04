import mongoose, {HydratedDocument} from "mongoose";
import {ObjectId} from "mongodb";
import {PostLikesType} from "../dto/postLikesDto";
import {CommentStatus} from "./generalTypes";

export type PostLikesMethodsType = {
  updateExistingPostLike: (myStatus: CommentStatus) => void
}

export type postLikesModelType = mongoose.Model<PostLikesType, {}, PostLikesMethodsType>

type PostLikesModelStaticType = mongoose.Model<PostLikesType> & {
  makeInstance(
    userId: ObjectId,
    postId: ObjectId,
    newStatus: CommentStatus
  ): HydratedDocument<PostLikesType, PostLikesMethodsType>
}

export type postLikesModelFullType = postLikesModelType & PostLikesModelStaticType

export type HydratedPostLikesType = HydratedDocument<PostLikesType, PostLikesMethodsType>