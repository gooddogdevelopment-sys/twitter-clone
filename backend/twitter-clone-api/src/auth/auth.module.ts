import { Module } from '@nestjs/common';
import { ClerkClientProvider } from './clerk-client.provider';
import { ClerkAuthGuard } from './clerk.guard';

@Module({
  providers: [ClerkClientProvider, ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}
