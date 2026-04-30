'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Send } from 'lucide-react';
import { GET_POST_BY_ID } from '@/lib/graphql/posts';
import { GET_COMMENTS_BY_POST, CREATE_COMMENT } from '@/lib/graphql/comments';
import PostCard from '@/components/posts/PostCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatRelativeTime } from '@/lib/utils/time';

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = parseInt(id, 10);
  const router = useRouter();
  const { user } = useUser();
  const [commentText, setCommentText] = useState('');

  const { data: postData, loading: postLoading } = useQuery(GET_POST_BY_ID, {
    variables: { id: postId },
  });

  const { data: commentsData, loading: commentsLoading } = useQuery(GET_COMMENTS_BY_POST, {
    variables: { postId },
  });

  const [createComment, { loading: submitting }] = useMutation(CREATE_COMMENT, {
    variables: { postId, content: commentText },
    onCompleted() {
      setCommentText('');
    },
    refetchQueries: [
      { query: GET_COMMENTS_BY_POST, variables: { postId } },
      { query: GET_POST_BY_ID, variables: { id: postId } },
    ],
  });

  const post = postData?.post;
  const comments = commentsData?.commentsByPost ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    createComment();
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-900 dark:text-zinc-100" />
        </button>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Post</h1>
      </header>

      {/* Post */}
      {postLoading ? (
        <div className="px-4 py-6 border-b border-zinc-200 dark:border-zinc-800 animate-pulse space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            </div>
          </div>
        </div>
      ) : post ? (
        <PostCard
          id={post.id}
          content={post.content}
          createdAt={post.createdAt}
          likesCount={post.likesCount}
          isLikedByCurrentUser={post.isLikedByCurrentUser}
          repostsCount={post.repostsCount}
          isRepostedByCurrentUser={post.isRepostedByCurrentUser}
          commentsCount={post.commentsCount}
          authorUsername={post.user?.username}
          authorImageUrl={null}
        />
      ) : null}

      {/* Comment composer */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex-shrink-0">
          <UserAvatar
            imageUrl={user?.imageUrl}
            displayName={user?.username ?? 'You'}
          />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Post your reply"
            className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </form>

      {/* Comments */}
      {commentsLoading ? (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          No replies yet. Be the first!
        </div>
      ) : (
        <div>
          {comments.map((comment: any) => (
            <div
              key={comment.id}
              className="flex gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex-shrink-0">
                <UserAvatar
                  imageUrl={null}
                  displayName={comment.user?.username ?? 'User'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {comment.user?.username}
                  </span>
                  <span className="text-zinc-500 text-sm">
                    @{comment.user?.username}
                  </span>
                  <span className="text-zinc-500 text-sm">·</span>
                  <time className="text-zinc-500 text-sm">
                    {formatRelativeTime(comment.createdAt)}
                  </time>
                </div>
                <p className="text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
