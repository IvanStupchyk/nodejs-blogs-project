import mongoose from "mongoose";
import {CommentatorInfoType, CommentLikesInfoType} from "../../../types/generalTypes";
import {CommentType} from "../dto/createCommentDto";

const commentatorInfoSchema = new mongoose.Schema<CommentatorInfoType>({
  userId: {type: String, required: true},
  userLogin: {type: String, required: true}
})

const commentLikesInfoSchema = new mongoose.Schema<CommentLikesInfoType>({
  likesCount: {type: Number, required: true},
  dislikesCount: {type: Number, required: true}
})

export const commentSchema = new mongoose.Schema<CommentType>({
  id: {type: String, required: true},
  content: {type: String, required: true},
  postId: {type: String, required: true},
  commentatorInfo: {
    type: commentatorInfoSchema,
    required: true
  },
  likesInfo: {
    type: commentLikesInfoSchema,
    required: true
  },
  createdAt: {type: String, required: true}
})