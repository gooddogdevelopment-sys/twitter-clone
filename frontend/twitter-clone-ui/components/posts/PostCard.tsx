'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Repeat2, Heart, Share } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/time';

interface PostCardProps {
  id: number;
  content: string;
  createdAt: string;
}

export default function PostCard({ content, createdAt }: PostCardProps) {
  const { user } = useUser();

  const displayName = user?.fullName ?? user?.username ?? 'You';
  const handle = user?.username
    ? `@${user.username}`
    : user?.primaryEmailAddress?.emailAddress?.split('@')[0]
      ? `@${user.primaryEmailAddress.emailAddress.split('@')[0]}`
      : null;

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        )}
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
          <ActionButton icon={Heart} label="Like" />
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
