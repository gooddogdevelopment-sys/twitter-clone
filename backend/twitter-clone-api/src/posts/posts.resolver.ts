import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ClerkJwtPayload } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Mutation(() => Post)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.postsService.create(createPostInput, currentUser.sub);
  }

  @Query(() => [Post], { name: 'posts' })
  findAll(@CurrentUser() currentUser: ClerkJwtPayload) {
    return this.postsService.findAll(currentUser.sub);
  }

  @Query(() => Post, { name: 'post' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.postsService.findOne(id, currentUser.sub);
  }

  @Mutation(() => Post)
  updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postsService.update(updatePostInput.id, updatePostInput);
  }

  @Query(() => [Post], { name: 'postsByUser' })
  postsByUser(@Args('userId') userId: string) {
    return this.postsService.findByUserId(userId);
  }

  @Mutation(() => Post)
  removePost(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.remove(id);
  }
}
