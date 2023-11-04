import mongoose from "mongoose";
import {ExtendedLikesInfoType,} from "../types/generalTypes";

export const extendedPostLikesInfoSchema = new mongoose.Schema<ExtendedLikesInfoType>({
  likesCount: {type: Number, required: true},
  dislikesCount: {type: Number, required: true},
  newestLikes: []
})