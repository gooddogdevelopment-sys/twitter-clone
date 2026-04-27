import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClerkAuthGuard } from './auth/clerk.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-auth')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('auth-name')
  getHelloProtected(): string {
    return this.appService.getHello();
  }
}
