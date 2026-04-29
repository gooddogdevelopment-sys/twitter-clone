'use client';

import { ApolloProvider } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createApolloClient } from '@/lib/apollo-client';

export default function ApolloClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const client = useMemo(
    () => createApolloClient(getToken),
    [getToken],
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
