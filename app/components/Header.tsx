"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ onToggleBookmarks, onSearch, onGenreSelect }: { onToggleBookmarks?: () => void; onSearch?: (q: string) => void; onGenreSelect?: (genre: string) => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
    "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
    "Thriller", "Tragedy", "Isekai", "Martial Arts", "School Life", "Historical"
  ];

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (isHoveringTop) {
        lastScrollY.current = current;
        return;
      }

      if (current < 10) setIsVisible(true);
      else if (current > lastScrollY.current && current > 100) setIsVisible(false);
      else if (current < lastScrollY.current) setIsVisible(true);

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHoveringTop]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  }, [onSearch, searchValue]);

  return (
    <>
      <header 
        className={`w-full bg-gradient-to-b from-black via-black/95 to-transparent border-b border-[#2bd5d5]/20 backdrop-blur-xl fixed top-0 z-50 transition-transform duration-500 ease-in-out ${
          isVisible || isHoveringTop ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => setIsHoveringTop(true)}
        onMouseLeave={() => setIsHoveringTop(false)}
      >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="mkGradient" x1="0" x2="1">
                  <stop offset="0" stopColor="#2bd5d5" />
                  <stop offset="1" stopColor="#19bfbf" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="12" fill="#040506" />
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="28" fill="url(#mkGradient)">M</text>
            </svg>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent leading-none">Mikareads</h1>
              <span className="text-[8px] sm:text-[10px] text-[#93a9a9] tracking-wider uppercase">Read • Discover • Enjoy</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search manga..."
                className="w-full px-4 py-2 bg-[#0a0a0a]/80 border border-[#2bd5d5]/30 rounded-full text-[#e6f7f7] placeholder-[#93a9a9] focus:outline-none focus:border-[#2bd5d5] transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2bd5d5] hover:text-[#19bfbf]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav Actions */}
          <nav className="flex items-center gap-3">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex items-center justify-center p-2 rounded-full border border-[#2bd5d5]/20 text-[#aeeeee] bg-[#0a0a0a]/40 hover:bg-[#052424] transition-all"
              aria-label="Open search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Hamburger Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2bd5d5]/30 text-[#aeeeee] bg-[#0a0a0a]/60 hover:bg-[#052424] hover:border-[#2bd5d5] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Genres</span>
              </button>
              
              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#2bd5d5]/30 rounded-lg shadow-2xl shadow-[#2bd5d5]/10 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-bold text-[#2bd5d5] uppercase tracking-wider">Browse by Genre</div>
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => {
                            onGenreSelect?.(genre);
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-[#e6f7f7] hover:bg-[#2bd5d5]/10 hover:text-[#2bd5d5] rounded transition-colors"
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onToggleBookmarks}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#2bd5d5]/30 text-[#aeeeee] bg-[#0a0a0a]/60 hover:bg-[#052424] hover:border-[#2bd5d5] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Library</span>
            </button>
          </nav>
        </div>
      </div>
      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-start pt-24 px-4">
          <div className="max-w-3xl w-full mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); onSearch?.(searchValue); setSearchOpen(false); }} className="w-full">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search manga..."
                  className="w-full px-4 py-3 bg-[#0a0a0a]/90 border border-[#2bd5d5]/30 rounded-lg text-[#e6f7f7] placeholder-[#93a9a9] focus:outline-none focus:border-[#2bd5d5]"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2bd5d5] hover:text-[#19bfbf]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            <div className="mt-3 flex justify-end">
              <button onClick={() => setSearchOpen(false)} className="px-3 py-2 text-sm text-[#93a9a9]">Close</button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
