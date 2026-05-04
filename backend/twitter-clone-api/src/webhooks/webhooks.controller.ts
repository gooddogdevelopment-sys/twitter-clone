import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Webhook } from 'svix';
import { UsersService } from '../users/users.service';

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    username: string;
    [key: string]: unknown;
  };
}

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('CLERK_WEBHOOK_SECRET environment variable is not set');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    const wh = new Webhook(secret);
    let event: ClerkUserCreatedEvent;

    try {
      event = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkUserCreatedEvent;
    } catch (err) {
      this.logger.warn('Clerk webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received Clerk webhook event: ${event.type}`);

    if (event.type === 'user.created') {
      const clerkId = event.data.id;
      const username = event.data.username;
      const existing = await this.usersService.findByClerkId(clerkId);
      if (!existing) {
        await this.usersService.createFromClerk(clerkId, username);
        this.logger.log(`User created in database for Clerk ID: ${clerkId}`);
      } else {
        this.logger.warn(
          `User already exists for Clerk ID: ${clerkId}, skipping`,
        );
      }
    }

    return { received: true };
  }
}
