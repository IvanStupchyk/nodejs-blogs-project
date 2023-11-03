import 'reflect-metadata'
import {PostsQueryRepository} from "../infrastructure/repositories/postsQueryRepository";
import {CommentsService} from "../domains/comments/comments.service";
import {UsersRepository} from "../infrastructure/repositories/usersRepository";
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";
import {CommentsRepository} from "../infrastructure/repositories/comentsRepository";
import {CommentsQueryRepository} from "../infrastructure/repositories/comentsQueryRepository";
import {Container} from "inversify";

export const commentsContainer = new Container()
commentsContainer.bind(UsersRepository).to(UsersRepository)
commentsContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
commentsContainer.bind(CommentsRepository).to(CommentsRepository)
commentsContainer.bind(CommentsQueryRepository).to(CommentsQueryRepository)
commentsContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
commentsContainer.bind(CommentsService).to(CommentsService)