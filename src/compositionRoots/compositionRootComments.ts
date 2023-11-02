import 'reflect-metadata'
import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {CommentsService} from "../domains/comments/comments.service";
import {UsersRepository} from "../repositories/usersRepository";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {CommentsRepository} from "../repositories/comentsRepository";
import {CommentsQueryRepository} from "../repositories/comentsQueryRepository";
import {Container} from "inversify";

export const commentsContainer = new Container()
commentsContainer.bind(UsersRepository).to(UsersRepository)
commentsContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
commentsContainer.bind(CommentsRepository).to(CommentsRepository)
commentsContainer.bind(CommentsQueryRepository).to(CommentsQueryRepository)
commentsContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
commentsContainer.bind(CommentsService).to(CommentsService)