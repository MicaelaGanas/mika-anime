'use client'

import { useState, useEffect } from 'react';

interface BookmarkButtonProps {
  mangaId: string;
}

export default function BookmarkButton({ mangaId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleBookmark = async () => {
    setLoading(true);
    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/manga/${mangaId}/follow`, {
        method,
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      } else if (response.status === 401) {
        alert('Please login to bookmark manga');
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold transition-all ${
        isBookmarked
          ? 'bg-[#2bd5d5] text-black hover:bg-[#19bfbf]'
          : 'bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-[#2bd5d5]/20'
      } disabled:opacity-50`}
    >
      {loading ? '...' : isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  );
}
