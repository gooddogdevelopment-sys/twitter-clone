'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Home, User } from 'lucide-react';
import SidebarLink from './SidebarLink';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen flex flex-col justify-between py-2 px-2 xl:px-4 w-[72px] xl:w-[275px]">
      {/* Top: logo + nav */}
      <div className="flex flex-col gap-1">
        {/* X / Logo */}
        <Link
          href="/"
          className="flex items-center justify-center xl:justify-start p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors w-fit mb-1"
          aria-label="Home"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="w-7 h-7 fill-zinc-900 dark:fill-zinc-100"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <SidebarLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Post button */}
        <div className="mt-4 flex justify-center xl:justify-start">
          <Link
            href="/compose"
            className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full transition-colors
              w-[52px] h-[52px] xl:w-full xl:h-auto xl:px-8 xl:py-3 xl:text-lg"
            aria-label="Post"
          >
            {/* Plus icon shown on narrow sidebar */}
            <span className="xl:hidden text-2xl leading-none">+</span>
            <span className="hidden xl:block">Post</span>
          </Link>
        </div>
      </div>

      {/* Bottom: user */}
      <div className="flex items-center justify-center xl:justify-start gap-3 p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
        <UserButton />
        <span className="hidden xl:block text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          Account
        </span>
      </div>
    </aside>
  );
}
