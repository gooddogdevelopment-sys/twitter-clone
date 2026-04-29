'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { SEARCH_USERS } from '@/lib/graphql/users';
import { Search, User } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';

interface UserResult {
  id: string;
  username: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const { data, loading, error } = useQuery<{ searchUsers: UserResult[] }>(
    SEARCH_USERS,
    {
      variables: { query },
      skip: query.trim().length === 0,
    },
  );

  const users = data?.searchUsers ?? [];

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
      </header>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {/* Empty state — no query yet */}
        {!query && (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400 dark:text-zinc-600">
            <Search className="w-10 h-10" />
            <p className="text-base">Type a username to search</p>
          </div>
        )}

        {/* Loading */}
        {query && loading && (
          <div className="flex flex-col gap-3 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-6 text-center text-red-500 text-sm">
            Something went wrong. Please try again.
          </div>
        )}

        {/* No results */}
        {query && !loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400 dark:text-zinc-600">
            <User className="w-10 h-10" />
            <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
              No users found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm">Try a different username</p>
          </div>
        )}

        {/* Results */}
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <UserAvatar displayName={user.username} size={40} imageUrl={null} />

            <div className="min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {user.username}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                @{user.username}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
