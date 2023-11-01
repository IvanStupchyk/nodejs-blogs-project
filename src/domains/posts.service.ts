import {PostsRepository} from "../repositories/postsRepository";
import {PostType} from "../types/generalTypes";
import {ObjectId} from "mongodb";
import {PostsQueryRepository} from "../repositories/postsQueryRepository";

export class PostsService {
  constructor(protected postsQueryRepository: PostsQueryRepository,
              protected postsRepository: PostsRepository
  ) {}

  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: ObjectId
  ): Promise<PostType> {
    const newPost: PostType = new PostType(
      new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      new Date().toISOString(),
      ''
    )

    return await this.postsRepository.createPost(newPost, blogId)
  }

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    return await this.postsRepository.updatePostById(
      id,
      title,
      content,
      shortDescription,
      blogId
    )
  }

  async findPostById(id: string): Promise<PostType | null> {
    if (!ObjectId.isValid(id)) return null
    return await this.postsQueryRepository.findPostById(new ObjectId(id))
  }

  async deletePost(id: string): Promise<boolean> {
    return await this.postsRepository.deletePost(id)
  }
}