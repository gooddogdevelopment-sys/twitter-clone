'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { GET_USER_BY_USERNAME } from '@/lib/graphql/users';
import { GET_POSTS_BY_USER } from '@/lib/graphql/posts';
import { IS_FOLLOWING, FOLLOW_USER, UNFOLLOW_USER } from '@/lib/graphql/followers';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatRelativeTime } from '@/lib/utils/time';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  content: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  username: string;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // Fetch profile user
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery<{ getUserByUsername: UserProfile | null }>(GET_USER_BY_USERNAME, {
    variables: { username },
  });
  const user = userData?.getUserByUsername;

  // Is this the viewer's own profile?
  const isOwnProfile = clerkUser?.username === username;

  // Check follow status
  const {
    data: followData,
    loading: followLoading,
  } = useQuery<{ isFollowing: boolean }>(IS_FOLLOWING, {
    variables: { userId: user?.id },
    skip: !user?.id || isOwnProfile,
  });
  const following = followData?.isFollowing ?? false;

  // Follow mutation — optimistically update isFollowing cache
  const [followUser, { loading: followMutating }] = useMutation(FOLLOW_USER, {
    variables: { userIdToFollow: user?.id },
    update(cache) {
      cache.writeQuery({
        query: IS_FOLLOWING,
        variables: { userId: user?.id },
        data: { isFollowing: true },
      });
    },
  });

  // Unfollow mutation — optimistically update cache
  const [unfollowUser, { loading: unfollowMutating }] = useMutation(UNFOLLOW_USER, {
    variables: { userIdToUnfollow: user?.id },
    update(cache) {
      cache.writeQuery({
        query: IS_FOLLOWING,
        variables: { userId: user?.id },
        data: { isFollowing: false },
      });
    },
  });

  const isMutating = followMutating || unfollowMutating;

  // Posts
  const { data: postsData, loading: postsLoading } = useQuery<{
    postsByUser: Post[];
  }>(GET_POSTS_BY_USER, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });
  const posts = postsData?.postsByUser ?? [];

  return (
    <div>
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
        </button>
        <div>
          {userLoading ? (
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          ) : (
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {user?.username ?? username}
            </h1>
          )}
          {!userLoading && !postsLoading && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>
      </header>

      {/* User not found */}
      {!userLoading && (userError || !user) && (
        <div className="flex flex-col items-center gap-3 py-20 px-6 text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            This account doesn&apos;t exist
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Try searching for another.
          </p>
        </div>
      )}

      {/* Profile card */}
      {(userLoading || user) && (
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          {/* Banner */}
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800" />

          {/* Avatar + follow button row */}
          <div className="px-4 pb-4">
            <div className="flex justify-between items-start -mt-10 mb-3">
              {/* Avatar */}
              <div className="ring-4 ring-white dark:ring-black rounded-full">
                {userLoading ? (
                  <div className="w-20 h-20 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                ) : (
                  <UserAvatar
                    displayName={user!.username}
                    size={80}
                    imageUrl={null}
                  />
                )}
              </div>

              {/* Follow / Unfollow button */}
              {!userLoading && user && !isOwnProfile && (
                <div className="mt-12">
                  {followLoading ? (
                    <div className="h-9 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  ) : following ? (
                    <button
                      onClick={() => unfollowUser()}
                      disabled={isMutating}
                      className="group relative px-4 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-600 font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px] text-center"
                    >
                      <span className="group-hover:hidden">Following</span>
                      <span className="hidden group-hover:inline">Unfollow</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => followUser()}
                      disabled={isMutating}
                      className="px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px] text-center"
                    >
                      Follow
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User info */}
            {userLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            ) : (
              user && (
                <div>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {user.username}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    @{user.username}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span>Member of the flock</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Posts section */}
      {user && (
        <div>
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Posts</h2>
          </div>

          {postsLoading && (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 px-6 text-center">
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                No posts yet
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                When {user.username} posts, their posts will show up here.
              </p>
            </div>
          )}

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <UserAvatar displayName={user.username} size={40} imageUrl={null} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {user.username}
                    </span>
                    <span className="text-zinc-500 text-sm">@{user.username}</span>
                    <span className="text-zinc-500 text-sm">·</span>
                    <time
                      dateTime={post.createdAt}
                      title={new Date(post.createdAt).toLocaleString()}
                      className="text-zinc-500 text-sm hover:underline flex-shrink-0"
                    >
                      {formatRelativeTime(post.createdAt)}
                    </time>
                  </div>
                  <p className="text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
