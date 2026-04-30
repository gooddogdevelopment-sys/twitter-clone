'use client';

import { useQuery } from '@apollo/client';
import { GET_FEED } from '@/lib/graphql/posts';
import PostCard from './PostCard';

interface FeedPost {
  id: number;
  content: string;
  createdAt: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  repostsCount: number;
  isRepostedByCurrentUser: boolean;
  commentsCount: number;
  repostedByUsername?: string | null;
  user: {
    id: string;
    username: string;
  };
}

export default function PostFeed() {
  const { data, loading, error, refetch } = useQuery<{ feed: FeedPost[] }>(
    GET_FEED,
    { fetchPolicy: 'cache-and-network' },
  );

  if (loading && !data) {
    return <PostFeedSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Something went wrong loading your feed.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sky-500 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const posts = data?.feed ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-zinc-900 dark:text-zinc-100 font-bold text-xl">
          Your feed is empty
        </p>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Write your first post, or follow someone to see their posts here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          content={post.content}
          createdAt={post.createdAt}
          likesCount={post.likesCount}
          isLikedByCurrentUser={post.isLikedByCurrentUser}
          repostsCount={post.repostsCount}
          isRepostedByCurrentUser={post.isRepostedByCurrentUser}
          commentsCount={post.commentsCount}
          repostedByUsername={post.repostedByUsername}
          authorUsername={post.user.username}
          authorImageUrl={null}
        />
      ))}
    </div>
  );
}

function PostFeedSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="flex gap-2">
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
            </div>
            <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
