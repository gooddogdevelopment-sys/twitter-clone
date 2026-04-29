import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

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
          {children}
        </main>
      </div>
    </div>
  );
}
