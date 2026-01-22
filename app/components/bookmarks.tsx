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
    return <Series id={selectedManga} />;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#2bd5d5]/20 blur-3xl rounded-full" />
          <div className="relative text-8xl">📚</div>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent mb-3">No Bookmarks Yet</h2>
        <p className="text-base sm:text-lg text-[#93a9a9] max-w-md">Start exploring and bookmark your favorite manga to build your personal library!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#2bd5d5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent">
            My Bookmarks
          </h1>
        </div>
        <p className="text-sm sm:text-base text-[#93a9a9]">{bookmarks.length} {bookmarks.length === 1 ? 'manga' : 'manga'} saved</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {bookmarks.map((bookmark, index) => (
          <div key={bookmark.id} className="relative group cursor-pointer transition-all duration-300 opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}>
            <div
              onClick={() => setSelectedManga(bookmark.id)}
              className="relative w-full h-[170px] sm:h-[215px] md:h-[260px] rounded-lg sm:rounded-xl overflow-hidden border border-gray-800 group-hover:border-[#2bd5d5] group-hover:shadow-2xl group-hover:shadow-[#2bd5d5]/30 transition-all duration-300"
            >
              <div className="absolute inset-0">
                {bookmark.coverUrl ? (
                  <img
                    src={bookmark.coverUrl}
                    alt={bookmark.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-sm text-gray-500">No cover</div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-10">
                <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1 drop-shadow-lg group-hover:text-[#2bd5d5] transition-colors">
                  {bookmark.title}
                </h3>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBookmark(bookmark.id);
                }}
                className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/90 hover:bg-red-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center backdrop-blur-sm shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
