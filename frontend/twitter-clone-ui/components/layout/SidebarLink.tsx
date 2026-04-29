'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function SidebarLink({ href, label, icon: Icon }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-full px-4 py-3 text-xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 w-fit ${
        isActive ? 'font-bold' : 'font-normal'
      }`}
    >
      <Icon
        size={26}
        strokeWidth={isActive ? 2.5 : 2}
        className="text-zinc-900 dark:text-zinc-100"
      />
      <span className="hidden xl:block text-zinc-900 dark:text-zinc-100">{label}</span>
    </Link>
  );
}
