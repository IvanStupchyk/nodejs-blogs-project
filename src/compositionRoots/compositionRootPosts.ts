import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {CommentsService} from "../domains/comments.service";
import {UsersRepository} from "../repositories/usersRepository";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {CommentsRepository} from "../repositories/comentsRepository";
import {CommentsQueryRepository} from "../repositories/comentsQueryRepository";
import {PostsService} from "../domains/posts.service";
import {PostsRepository} from "../repositories/postsRepository";
import {PostController} from "../features/posts/postController";

const usersRepository = new UsersRepository()
const usersQueryRepository = new UsersQueryRepository()
const commentsRepository = new CommentsRepository()
const commentsQueryRepository = new CommentsQueryRepository()
const postsQueryRepository = new PostsQueryRepository()
const postsRepository = new PostsRepository()
const postsService = new PostsService(postsQueryRepository, postsRepository)

const commentsService = new CommentsService(
  usersQueryRepository,
  usersRepository,
  commentsRepository,
  commentsQueryRepository,
  postsQueryRepository
)

export const postController = new PostController(
  postsQueryRepository,
  commentsService,
  postsService
)