import mongoose from "mongoose";
import {BlogType} from "../dto/createBlogDto";

export const blogSchema = new mongoose.Schema<BlogType>({
  id: {type: String, required: true},
  name: {type: String, required: true},
  description: {type: String, required: true},
  websiteUrl: {type: String, required: true},
  isMembership: {type: Boolean, required: true},
  createdAt: {type: String, required: true}
})