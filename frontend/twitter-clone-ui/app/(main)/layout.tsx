import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import SearchBar from '@/components/layout/SearchBar';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1265px] mx-auto flex">
        <Sidebar />
        <main className="flex-1 min-h-screen border-x border-zinc-200 dark:border-zinc-800 max-w-[600px]">
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2">
            <Suspense fallback={<div className="h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
