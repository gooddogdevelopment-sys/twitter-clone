'use client';

import Image from 'next/image';
import { useState } from 'react';

interface UserAvatarProps {
  imageUrl?: string | null;
  displayName?: string | null;
  size?: number;
}

/** Picks a stable background color based on the display name. */
function getAvatarColor(name: string): string {
  const colors = [
    'bg-sky-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Returns up to two initials from a display name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserAvatar({
  imageUrl,
  displayName,
  size = 40,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = `w-10 h-10`;

  const name = displayName?.trim() || '?';
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  if (imageUrl && !imgError) {
    return (
      <Image
        src={imageUrl}
        alt={displayName ?? 'User avatar'}
        width={size}
        height={size}
        className={`rounded-full ${sizeClass} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full ${sizeClass} ${colorClass} flex items-center justify-center flex-shrink-0`}
      aria-label={`${name} avatar`}
    >
      <span className="text-white text-sm font-semibold leading-none select-none">
        {initials}
      </span>
    </div>
  );
}
