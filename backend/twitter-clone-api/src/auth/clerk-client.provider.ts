import { Provider } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import type { ClerkClient } from '@clerk/backend';

export const CLERK_CLIENT = 'CLERK_CLIENT';

// Re-export the type so consumers can annotate without a direct @clerk/backend import.
export type { ClerkClient };

export const ClerkClientProvider: Provider = {
  provide: CLERK_CLIENT,
  useFactory: (): ClerkClient => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }
    return createClerkClient({ secretKey });
  },
};
