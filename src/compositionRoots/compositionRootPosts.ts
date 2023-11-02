import 'reflect-metadata'
import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {CommentsService} from "../domains/comments.service";
import {UsersRepository} from "../repositories/usersRepository";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {CommentsRepository} from "../repositories/comentsRepository";
import {CommentsQueryRepository} from "../repositories/comentsQueryRepository";
import {PostsService} from "../domains/posts.service";
import {PostsRepository} from "../repositories/postsRepository";
import {Container} from "inversify";

export const postContainer = new Container()
postContainer.bind(UsersRepository).to(UsersRepository)
postContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
postContainer.bind(CommentsRepository).to(CommentsRepository)
postContainer.bind(CommentsQueryRepository).to(CommentsQueryRepository)
postContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
postContainer.bind(PostsRepository).to(PostsRepository)
postContainer.bind(PostsService).to(PostsService)
postContainer.bind(CommentsService).to(CommentsService)