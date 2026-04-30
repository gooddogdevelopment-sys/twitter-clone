import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Reposts } from './entities/reposts.entity';
import { RepostsService } from './reposts.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ClerkJwtPayload } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Resolver(() => Reposts)
export class RepostsResolver {
  constructor(private readonly repostsService: RepostsService) {}

  @Mutation(() => Reposts)
  repost(
    @Args('postId', { type: () => Int }) postId: number,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.repostsService.repost(postId, currentUser.sub);
  }
}
