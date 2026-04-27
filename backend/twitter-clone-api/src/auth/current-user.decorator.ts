import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { verifyToken } from '@clerk/backend';

// Derive the payload type from the return type of verifyToken rather than
// importing JwtPayload directly from @clerk/types.
export type ClerkJwtPayload = Awaited<ReturnType<typeof verifyToken>>;

/**
 * Extracts the verified Clerk auth payload from the request.
 *
 * Usage (on a protected route):
 *   @UseGuards(ClerkAuthGuard)
 *   @Mutation(() => Post)
 *   createPost(@CurrentUser() user: ClerkJwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkJwtPayload => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const request = gqlCtx.getContext<{
      req: Request & { auth: ClerkJwtPayload };
    }>().req;
    return request.auth;
  },
);
