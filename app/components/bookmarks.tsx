"use client"

import { useState, useEffect } from 'react';
import Series from './series';

export default function Bookmarks({ visible, onBack }: { visible?: boolean; onBack?: () => void }) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [selectedManga, setSelectedManga] = useState<string | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(saved);
  }, []);

  const removeBookmark = (id: string) => {
    const filtered = bookmarks.filter(b => b.id !== id);
    localStorage.setItem('bookmarks', JSON.stringify(filtered));
    setBookmarks(filtered);
  };

  if (visible === false) return null;

  if (selectedManga) {
    return (
      <div>
        <button
          onClick={() => setSelectedManga(null)}
          className="mb-4 px-4 py-2 bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded hover:bg-[#2bd5d5]/20 transition-colors"
        >
          ← Back to Bookmarks
        </button>
        <Series id={selectedManga} />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-[#2bd5d5] mb-2">No Bookmarks Yet</h2>
        <p className="text-[#93a9a9]">Start bookmarking your favorite manga!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-[#2bd5d5] mb-6">My Bookmarks</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="group relative">
            <div
              onClick={() => setSelectedManga(bookmark.id)}
              className="cursor-pointer bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-[#2bd5d5] transition-all"
            >
              {bookmark.coverUrl ? (
                <img
                  src={bookmark.coverUrl}
                  alt={bookmark.title}
                  className="w-full h-72 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-72 flex items-center justify-center text-gray-500">
                  No cover
                </div>
              )}
              <div className="p-2">
                <h3 className="text-sm font-semibold text-white line-clamp-2">
                  {bookmark.title}
                </h3>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeBookmark(bookmark.id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
