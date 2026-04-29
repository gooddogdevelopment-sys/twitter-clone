import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Likes } from './entities/likes.entity';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ClerkJwtPayload } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Resolver(() => Likes)
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @Mutation(() => Likes)
  likePost(
    @Args('postId', { type: () => Int }) postId: number,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.likesService.likePost(postId, currentUser.sub);
  }
}
