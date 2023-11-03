import {PostsRepository} from "../../infrastructure/repositories/postsRepository";
import {ObjectId} from "mongodb";
import {PostsQueryRepository} from "../../infrastructure/repositories/postsQueryRepository";
import {inject, injectable} from "inversify";
import {PostType} from "../../dto/postDto";
import {PostModel} from "../../db/db";
import {BlogsQueryRepository} from "../../infrastructure/repositories/blogsQueryRepository";

@injectable()
export class PostsService {
  constructor(@inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
              @inject(PostsRepository) protected postsRepository: PostsRepository,
              @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository
  ) {}

  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: ObjectId
  ): Promise<PostType> {
    const blog = await this.blogsQueryRepository.findBlogById(blogId)

    const initialPostModel = PostModel.makeInstance(
      title,
      shortDescription,
      content,
      blogId,
      blog?.name ?? ''
    )

    await this.postsRepository.save(initialPostModel)

    return {
      id: initialPostModel.id,
      title: initialPostModel.title,
      content: initialPostModel.content,
      shortDescription: initialPostModel.shortDescription,
      blogId: initialPostModel.blogId,
      createdAt: initialPostModel.createdAt,
      blogName: initialPostModel.blogName
    }
  }

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    if (!ObjectId.isValid(blogId)) return false

    const post = await this.postsQueryRepository.findPostById(new ObjectId(id))
    if (!post) return false

    post.updatePost(title, content, shortDescription,)

    await this.postsRepository.save(post)
    return true
  }

  async findPostById(id: string): Promise<PostType | null> {
    if (!ObjectId.isValid(id)) return null
    return await this.postsQueryRepository.findPostByIdWithoutMongoId(new ObjectId(id))
  }

  async deletePost(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    return await this.postsRepository.deletePost(new ObjectId(id))
  }
}