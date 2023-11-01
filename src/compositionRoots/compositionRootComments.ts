import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {CommentsService} from "../domains/comments.service";
import {UsersRepository} from "../repositories/usersRepository";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {CommentsRepository} from "../repositories/comentsRepository";
import {CommentsQueryRepository} from "../repositories/comentsQueryRepository";
import {CommentsController} from "../features/comments/commentsController";

const usersRepository = new UsersRepository()
const usersQueryRepository = new UsersQueryRepository()
const commentsRepository = new CommentsRepository()
const commentsQueryRepository = new CommentsQueryRepository()
const postsQueryRepository = new PostsQueryRepository()

const commentsService = new CommentsService(
  usersQueryRepository,
  usersRepository,
  commentsRepository,
  commentsQueryRepository,
  postsQueryRepository
)

export const commentsController = new CommentsController(commentsService)