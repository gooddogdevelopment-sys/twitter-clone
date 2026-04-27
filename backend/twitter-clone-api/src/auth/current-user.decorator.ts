import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { verifyToken } from '@clerk/backend';
import { Request } from 'express';

// Derive the payload type from the return type of verifyToken rather than
// importing JwtPayload directly from @clerk/types.
export type ClerkJwtPayload = Awaited<ReturnType<typeof verifyToken>>;

/**
 * Extracts the verified Clerk auth payload from the request.
 *
 * Usage (on a protected route):
 *   @UseGuards(ClerkAuthGuard)
 *   @Get('me')
 *   getMe(@CurrentUser() user: ClerkJwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkJwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as Request & { auth: ClerkJwtPayload }).auth;
  },
);
