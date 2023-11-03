import mongoose from "mongoose";
import {UserCommentLikesType} from "../types/generalTypes";

export const userCommentLikesSchema = new mongoose.Schema<UserCommentLikesType>({
  commentId: {type: String, required: true},
  myStatus: {type: String, required: true},
  createdAt: {type: String, required: true}
})