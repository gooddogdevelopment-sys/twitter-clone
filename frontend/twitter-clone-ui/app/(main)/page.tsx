import PostComposer from '@/components/posts/PostComposer';
import PostFeed from '@/components/posts/PostFeed';

export default function HomePage() {
  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Home</h1>
      </header>

      <PostComposer />
      <PostFeed />
    </div>
  );
}
