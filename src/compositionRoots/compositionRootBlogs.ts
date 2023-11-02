import 'reflect-metadata'
import {BlogsQueryRepository} from "../repositories/blogsQueryRepository";
import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {BlogsService} from "../domains/blogs/blogs.service";
import {PostsService} from "../domains/posts/posts.service";
import {PostsRepository} from "../repositories/postsRepository";
import {BlogsRepository} from "../repositories/blogsRepository";
import {Container} from "inversify";

export const blogsContainer = new Container()
blogsContainer.bind(BlogsQueryRepository).to(BlogsQueryRepository)
blogsContainer.bind(BlogsRepository).to(BlogsRepository)
blogsContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
blogsContainer.bind(PostsRepository).to(PostsRepository)
blogsContainer.bind(BlogsService).to(BlogsService)
blogsContainer.bind(PostsService).to(PostsService)