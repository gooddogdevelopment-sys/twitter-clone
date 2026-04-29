import PostComposer from '@/components/posts/PostComposer';

export default function HomePage() {
  return (
    <div>
      {/* Sticky page header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Home</h1>
      </header>

      {/* Post composer */}
      <PostComposer />

      {/* Feed placeholder */}
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600">
        <p className="text-lg">Feed coming soon</p>
      </div>
    </div>
  );
}
