'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync when navigating back/forward
  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (q.trim().length === 0) {
        router.push('/');
      } else {
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }
    }, 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length === 0) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  function handleClear() {
    setValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push('/');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-black rounded-full px-4 py-2 transition-colors"
    >
      <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search users"
        aria-label="Search users"
        className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none min-w-0"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
