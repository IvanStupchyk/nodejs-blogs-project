import {BlogModel, PostModel} from "../../db/db"
import 'reflect-metadata'
import {injectable} from "inversify";
import {BlogType} from "../../domains/blogs/dto/createBlogDto";
import {HydratedPostType} from "../../types/postsTypes";

@injectable()
export class PostsRepository {
  async save(model: HydratedPostType) {
    return await model.save()
  }

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    const linkedBlog: BlogType | null = await BlogModel
      .findOne({id: blogId}, {_id: 0, __v: 0})
      .lean()

    const result = await PostModel.findOneAndUpdate({id}, {
      $set: {
        title,
        content,
        shortDescription,
        blogId,
        blogName: linkedBlog?.name ?? ''
      }
    })

    return !!result
  }

  async deletePost(id: string): Promise<boolean> {
    const deletedPost = await PostModel.deleteOne({id}).exec()

    return deletedPost.deletedCount === 1
  }
}