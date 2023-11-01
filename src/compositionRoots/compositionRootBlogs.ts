import {BlogsQueryRepository} from "../repositories/blogsQueryRepository";
import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {BlogsService} from "../domains/blogs.service";
import {PostsService} from "../domains/posts.service";
import {PostsRepository} from "../repositories/postsRepository";
import {BlogsRepository} from "../repositories/blogsRepository";
import {BlogController} from "../features/blogs/blogController";

const blogsQueryRepository = new BlogsQueryRepository()
const blogsRepository = new BlogsRepository()
const postsQueryRepository = new PostsQueryRepository()
const postsRepository = new PostsRepository()
const blogsService = new BlogsService(blogsRepository, blogsQueryRepository)
const postsService = new PostsService(postsQueryRepository, postsRepository)

export const blogController = new BlogController(
  blogsQueryRepository,
  postsQueryRepository,
  blogsService,
  postsService
)