'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@apollo/client';
import { MessageCircle, Repeat2, Heart, Share } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/time';
import UserAvatar from '@/components/ui/UserAvatar';
import { LIKE_POST } from '@/lib/graphql/likes';
import { GET_FEED } from '@/lib/graphql/posts';

interface PostCardProps {
  id: number;
  content: string;
  createdAt: string;
  likesCount?: number;
  /** When provided, overrides the current viewer's Clerk identity for display */
  authorUsername?: string;
  authorImageUrl?: string | null;
}

export default function PostCard({
  id,
  content,
  createdAt,
  likesCount = 0,
  authorUsername,
  authorImageUrl,
}: PostCardProps) {
  const { user } = useUser();
  const [optimisticCount, setOptimisticCount] = useState(likesCount);
  const [liked, setLiked] = useState(false);

  const [likePost, { loading: liking }] = useMutation(LIKE_POST, {
    variables: { postId: id },
    onCompleted(data) {
      const isActive: boolean = data.likePost.isActive;
      setLiked(isActive);
      setOptimisticCount((c) => isActive ? c + 1 : Math.max(0, c - 1));
    },
    refetchQueries: [{ query: GET_FEED }],
  });

  // If caller supplies an author, use it; otherwise fall back to the signed-in user
  const displayName = authorUsername ?? user?.fullName ?? user?.username ?? 'You';
  const handle = authorUsername
    ? `@${authorUsername}`
    : user?.username
      ? `@${user.username}`
      : user?.primaryEmailAddress?.emailAddress?.split('@')[0]
        ? `@${user.primaryEmailAddress.emailAddress.split('@')[0]}`
        : null;
  const imageUrl = authorImageUrl !== undefined ? authorImageUrl : user?.imageUrl;

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <UserAvatar imageUrl={imageUrl} displayName={displayName} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
            {displayName}
          </span>
          {handle && (
            <span className="text-zinc-500 text-sm truncate">{handle}</span>
          )}
          <span className="text-zinc-500 text-sm">·</span>
          <time
            dateTime={createdAt}
            title={new Date(createdAt).toLocaleString()}
            className="text-zinc-500 text-sm hover:underline flex-shrink-0"
          >
            {formatRelativeTime(createdAt)}
          </time>
        </div>

        {/* Content */}
        <p className="text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
          {content}
        </p>

        {/* Action row */}
        <div className="flex items-center justify-between mt-3 text-zinc-500 max-w-[300px] -ml-2">
          <ActionButton icon={MessageCircle} label="Reply" />
          <ActionButton icon={Repeat2} label="Repost" />
          <button
            aria-label="Like"
            disabled={liking}
            onClick={() => likePost()}
            className={`flex items-center gap-1.5 p-2 rounded-full transition-colors
              ${liked
                ? 'text-pink-500 dark:text-pink-400'
                : 'hover:bg-pink-100 hover:text-pink-500 dark:hover:bg-pink-900/30 dark:hover:text-pink-400'
              }`}
          >
            <Heart
              size={18}
              strokeWidth={1.75}
              fill={liked ? 'currentColor' : 'none'}
            />
            {optimisticCount > 0 && (
              <span className="text-xs">{optimisticCount}</span>
            )}
          </button>
          <ActionButton icon={Share} label="Share" />
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="flex items-center gap-1.5 p-2 rounded-full hover:bg-sky-100 hover:text-sky-500 dark:hover:bg-sky-900/30 dark:hover:text-sky-400 transition-colors group"
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}
