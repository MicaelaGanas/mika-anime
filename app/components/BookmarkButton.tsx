'use client'

import { useState, useEffect } from 'react';

interface BookmarkButtonProps {
  mangaId: string;
  title: string;
  coverUrl?: string;
}

export default function BookmarkButton({ mangaId, title, coverUrl }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Check if already bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.some((b: any) => b.id === mangaId));
  }, [mangaId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    if (isBookmarked) {
      // Remove bookmark
      const filtered = bookmarks.filter((b: any) => b.id !== mangaId);
      localStorage.setItem('bookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      // Add bookmark
      bookmarks.push({
        id: mangaId,
        title,
        coverUrl,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`px-4 py-2 rounded font-semibold transition-all ${
        isBookmarked
          ? 'bg-[#2bd5d5] text-black hover:bg-[#19bfbf]'
          : 'bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-[#2bd5d5]/20'
      }`}
    >
      {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  );
}
