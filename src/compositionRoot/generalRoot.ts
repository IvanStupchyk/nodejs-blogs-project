import 'reflect-metadata'
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";
import {DevicesRepository} from "../infrastructure/repositories/DevicesRepository";
import {AuthService} from "../application/auth.service";
import {UsersRepository} from "../infrastructure/repositories/usersRepository";
import {Container} from "inversify";
import {LikesQueryRepository} from "../infrastructure/repositories/likesQueryRepository";
import {BlogsQueryRepository} from "../infrastructure/repositories/blogsQueryRepository";
import {BlogsRepository} from "../infrastructure/repositories/blogsRepository";
import {PostsQueryRepository} from "../infrastructure/repositories/postsQueryRepository";
import {PostsRepository} from "../infrastructure/repositories/postsRepository";
import {LikesRepository} from "../infrastructure/repositories/likesRepository";
import {BlogsService} from "../domains/blogs/blogs.service";
import {PostsService} from "../domains/posts/posts.service";
import {CommentsRepository} from "../infrastructure/repositories/comentsRepository";
import {CommentsQueryRepository} from "../infrastructure/repositories/comentsQueryRepository";
import {CommentsService} from "../domains/comments/comments.service";
import {DevicesService} from "../domains/devices/devices.service";
import {UsersService} from "../application/users.service";

export const generalContainer = new Container()
generalContainer.bind(DevicesRepository).to(DevicesRepository)
generalContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
generalContainer.bind(UsersRepository).to(UsersRepository)
generalContainer.bind(LikesQueryRepository).to(LikesQueryRepository)
generalContainer.bind(BlogsQueryRepository).to(BlogsQueryRepository)
generalContainer.bind(BlogsRepository).to(BlogsRepository)
generalContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
generalContainer.bind(PostsRepository).to(PostsRepository)
generalContainer.bind(LikesRepository).to(LikesRepository)
generalContainer.bind(CommentsRepository).to(CommentsRepository)
generalContainer.bind(CommentsQueryRepository).to(CommentsQueryRepository)
generalContainer.bind(AuthService).to(AuthService)
generalContainer.bind(BlogsService).to(BlogsService)
generalContainer.bind(PostsService).to(PostsService)
generalContainer.bind(CommentsService).to(CommentsService)
generalContainer.bind(DevicesService).to(DevicesService)
generalContainer.bind(UsersService).to(UsersService)