'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@apollo/client';
import Image from 'next/image';
import { CREATE_POST } from '@/lib/graphql/posts';

const MAX_CHARS = 280;

interface PostComposerProps {
  onPostCreated?: () => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [createPost, { loading }] = useMutation(CREATE_POST);

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0;
  const canPost = !isEmpty && !isOverLimit && !loading;

  // Fraction of the circle to fill (clamped so it never goes negative)
  const circumference = 2 * Math.PI * 12;
  const filledFraction = Math.min(content.length / MAX_CHARS, 1);
  const strokeDashoffset = circumference * (1 - filledFraction);
  const ringColor = isOverLimit ? '#ef4444' : remaining <= 20 ? '#f59e0b' : '#38bdf8';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError(null);
    // Auto-resize textarea
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!canPost) return;
    setError(null);

    try {
      await createPost({
        variables: { createPostInput: { content: content.trim() } },
      });

      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      onPostCreated?.();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('createPost error:', err);
    }
  };

  return (
    <div className="flex gap-3 px-4 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName ?? 'Your avatar'}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        )}
      </div>

      {/* Input area */}
      <div className="flex-1 flex flex-col min-w-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="What is happening?!"
          rows={2}
          className="w-full resize-none bg-transparent text-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-600 outline-none leading-relaxed pt-2"
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          {/* Left: future media/emoji buttons go here */}
          <div />

          <div className="flex items-center gap-4">
            {/* Character counter — only visible once the user starts typing */}
            {content.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Ring */}
                <svg
                  viewBox="0 0 30 30"
                  className="w-[26px] h-[26px] -rotate-90"
                  aria-label={`${remaining} characters remaining`}
                >
                  <circle
                    cx="15" cy="15" r="12"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="3"
                    className="dark:stroke-zinc-700"
                  />
                  <circle
                    cx="15" cy="15" r="12"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Numeric countdown when close to limit */}
                {remaining <= 20 && (
                  <span
                    className={`text-sm tabular-nums ${
                      isOverLimit ? 'text-red-500' : 'text-zinc-500'
                    }`}
                  >
                    {remaining}
                  </span>
                )}
              </div>
            )}

            {/* Post button */}
            <button
              onClick={handleSubmit}
              disabled={!canPost}
              className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-full px-5 py-2 text-sm transition-colors"
            >
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
