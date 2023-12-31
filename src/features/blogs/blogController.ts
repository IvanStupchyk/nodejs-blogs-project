import {BlogsQueryRepository} from "../../infrastructure/repositories/blogsQueryRepository";
import {PostsQueryRepository} from "../../infrastructure/repositories/postsQueryRepository";
import {BlogsService} from "../../domains/blogs/blogs.service";
import {PostsService} from "../../domains/posts/posts.service";
import {GetSortedBlogsModel} from "./models/GetSortedBlogsModel";
import {Response} from "express";
import {GetBlogModel} from "./models/GetBlogModel";
import {GetSortedPostsModel} from "../posts/models/GetSortedPostsModel";
import {CreateBlogModel} from "./models/CreateBlogModel";
import {URIParamsBlogIdModel} from "./models/URIParamsBlogIdModel";
import {CreatePostForSpecificBlogModel} from "../posts/models/CreatePostForSpecificBlogModel";
import {ObjectId} from "mongodb";
import {UpdateBlogModel} from "./models/UpdateBlogModel";
import {DeleteBlogModel} from "./models/DeleteBlogModel";
import {inject, injectable} from "inversify";
import {jwtService} from "../../application/jwt-service";
import {HTTP_STATUSES} from "../../utils/utils";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../../types/generalTypes";

@injectable()
export class BlogController {
  constructor(@inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository,
              @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
              @inject(BlogsService) protected blogsService: BlogsService,
              @inject(PostsService) protected postsService: PostsService) {
  }

  async getBlogs(req: RequestWithQuery<GetSortedBlogsModel>, res: Response) {
    res.json(await this.blogsQueryRepository.getSortedBlogs(req.query))
  }

  async getCurrentBlog(req: RequestWithParams<GetBlogModel>, res: Response) {
    const foundBlog = await this.blogsService.findBlogById(req.params.id)

    !foundBlog
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundBlog)
  }

  async getPostsForBlog(
    req: RequestWithParamsAndQuery<GetBlogModel, GetSortedPostsModel>,
    res: Response
  ) {
    const foundBlog = await this.blogsService.findBlogById(req.params.id)

    if (!foundBlog) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    let userId
    if (req.headers?.authorization) {
      const accessToken = req.headers.authorization.split(' ')[1]
      userId = await jwtService.getUserIdByAccessToken(accessToken)
    }

    const foundPosts = await this.postsQueryRepository.findPostsByIdForSpecificBlog(req.query, req.params.id, userId)
    res.send(foundPosts)
  }

  async createBlog(req: RequestWithBody<CreateBlogModel>, res: Response) {
    const {name, websiteUrl, description} = req.body
    const newBlog = await this.blogsService.createBlog(name, description, websiteUrl)

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
  }

  async createPostForSpecificBlog(
    req: RequestWithParamsAndBody<URIParamsBlogIdModel, CreatePostForSpecificBlogModel>,
    res: Response
  ) {
    const {title, content, shortDescription} = req.body
    const blogId = req.params.id

    const foundBlog = await this.blogsService.findBlogById(req.params.id)

    if (!foundBlog) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    const newPost = await this.postsService.createPost(title, content, shortDescription, new ObjectId(blogId))
    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
  }

  async updateBlog(req: RequestWithParamsAndBody<URIParamsBlogIdModel, UpdateBlogModel>, res: Response) {
    const {name, websiteUrl, description} = req.body

    const updatedBlog = await this.blogsService.updateBlogById(
      req.params.id,
      name,
      description,
      websiteUrl
    )

    !updatedBlog
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }

  async deleteBlog(req: RequestWithParams<DeleteBlogModel>, res: Response) {
    const isBlogExist = await this.blogsService.deleteBlog(req.params.id)

    res.sendStatus(!isBlogExist
      ? HTTP_STATUSES.NOT_FOUND_404
      : HTTP_STATUSES.NO_CONTENT_204
    )
  }
}