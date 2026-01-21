"use client"

import React, { useEffect, useState, useRef } from "react";
import { fetchJsonCached, clearFetchCache } from "../lib/fetchCache";
import Header from "./Header";
import Bookmarks from "./bookmarks";

interface ReaderProps {
  chapterId: string;
  onClose: () => void;
  chapters?: any[];
  onRequestChapterChange?: (id: string) => void;
}

export default function Reader({ chapterId, onClose, chapters = [], onRequestChapterChange }: ReaderProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [mode, setMode] = useState<"scroll" | "paged">("scroll");
  const [loading, setLoading] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [hoveringTop, setHoveringTop] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (hoveringTop) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY < 50) setHeaderVisible(true);
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) setHeaderVisible(false);
      else if (currentScrollY < lastScrollY.current) setHeaderVisible(true);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hoveringTop]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    // Clear cache when chapter changes to force fresh fetch
    clearFetchCache();
    
    // Retry logic for Vercel reliability
    const fetchWithRetry = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const d = await fetchJsonCached(`/api/chapter/${chapterId}`);
          console.log('Chapter data received:', d); // DEBUG
          
          if (!mounted) return;
          
          // Only reject if there's an explicit error
          if (d?.error) {
            console.error('API returned error:', d.error, d.details); // DEBUG
            if (i < retries) {
              await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Wait before retry
              continue;
            }
            setPages([]);
            return;
          }
          
          const base = d.baseUrl;
          const chapter = d.chapter || {};
          const hash = chapter.hash;
          const files: string[] = chapter.data || [];
          
          console.log('Parsed:', { base, hash, filesCount: files?.length }); // DEBUG
          
          if (base && hash && files && files.length > 0) {
            // Proxy images through our API to avoid MangaDex hotlinking restrictions
            const imgs = files.map((f: string) => {
              const originalUrl = `${base}/data/${hash}/${f}`;
              return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
            });
            setPages(imgs);
            return; // Success, exit retry loop
          } else {
            console.warn('Missing required fields:', { hasBase: !!base, hasHash: !!hash, filesCount: files?.length }); // DEBUG
            setPages([]);
            return;
          }
        } catch (err) {
          console.error(`Error fetching chapter (attempt ${i + 1}):`, err);
          if (i < retries) {
            await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Wait before retry
          } else {
            setPages([]);
          }
        }
      }
    };

    fetchWithRetry().finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [chapterId]);

  // Find current chapter index and get prev/next
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  const currentChapter = chapters[currentIndex];
  
  // Get chapter label
  const getChapterLabel = () => {
    if (!currentChapter) return "Chapter";
    const chNum = currentChapter.attributes?.chapter;
    const title = currentChapter.attributes?.title;
    if (chNum && title) return `Ch. ${chNum}: ${title}`;
    if (chNum) return `Chapter ${chNum}`;
    if (title) return title;
    return "Chapter";
  };

  if (showBookmarks) {
    return (
      <div className="min-h-screen bg-[#040506]">
        <Header onToggleBookmarks={() => setShowBookmarks(false)} />
        <Bookmarks onBack={() => setShowBookmarks(false)} />
      </div>
    );
  }

  if (loading) return <div className="text-[#93a9a9] text-center py-8">Loading pages…</div>;
  if (pages.length === 0) return (
    <div className="text-[#93a9a9] text-center py-8">
      <div className="mb-2">This chapter isn't available to view here.</div>
      <a className="text-[#2bd5d5] underline" target="_blank" rel="noopener noreferrer" href={`https://mangadex.org/chapter/${chapterId}`}>Read on MangaDex</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#040506] pb-12">
      {/* Reader Header - Auto-hide on scroll */}
      <div 
        className={`fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black via-black/95 to-transparent border-b border-[#2bd5d5]/20 backdrop-blur-xl transition-transform duration-500 ${
          headerVisible || hoveringTop ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => setHoveringTop(true)}
        onMouseLeave={() => setHoveringTop(false)}
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          {/* Top row - Back button and Library */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1 sm:gap-2 text-[#2bd5d5] hover:text-[#19bfbf] transition-colors font-semibold text-xs sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Chapters</span>
              <span className="sm:hidden">Back</span>
            </button>
            <button
              onClick={() => setShowBookmarks(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
            >
              📚 <span className="hidden sm:inline">Library</span>
            </button>
          </div>
          
          {/* Chapter title */}
          <div className="text-center mb-2 sm:mb-3">
            <h2 className="text-sm sm:text-lg font-bold text-[#e6f7f7] truncate px-2">{getChapterLabel()}</h2>
          </div>
          
          {/* Navigation row */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={() => onRequestChapterChange && prevChapter && onRequestChapterChange(prevChapter.id)}
              disabled={!prevChapter || !onRequestChapterChange}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">← Prev</span>
              <span className="sm:hidden">←</span>
            </button>
            
            <button
              onClick={() => setMode(m => (m === "scroll" ? "paged" : "scroll"))}
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
            >
              {mode === "scroll" ? "📖" : "📜"}
              <span className="hidden sm:inline ml-1">{mode === "scroll" ? "Paged" : "Scroll"}</span>
            </button>
            
            <button
              onClick={() => onRequestChapterChange && nextChapter && onRequestChapterChange(nextChapter.id)}
              disabled={!nextChapter || !onRequestChapterChange}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 pt-32 sm:pt-36">
        {mode === "scroll" ? (
          <div className="space-y-2">
            {pages.map((p, i) => (
              <img 
                key={i} 
                src={p} 
                alt={`page ${i + 1}`} 
                className="w-full rounded-lg shadow-lg" 
                onError={(e) => console.error(`Failed to load page ${i + 1}:`, p, e)}
                onLoad={() => console.log(`Loaded page ${i + 1}`)}
              />
            ))}
          </div>
        ) : (
          <PagedView pages={pages} />
        )}
        
        {/* Bottom Navigation */}
        <div className="mt-8 mb-4 flex items-center justify-center gap-2 sm:gap-4 p-4 bg-[#0a0a0a]/60 border border-[#2bd5d5]/20 rounded-lg">
          <button
            onClick={() => onRequestChapterChange && prevChapter && onRequestChapterChange(prevChapter.id)}
            disabled={!prevChapter || !onRequestChapterChange}
            className="flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous Chapter
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
          >
            All Chapters
          </button>
          <button
            onClick={() => onRequestChapterChange && nextChapter && onRequestChapterChange(nextChapter.id)}
            disabled={!nextChapter || !onRequestChapterChange}
            className="flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next Chapter →
          </button>
        </div>
      </div>
    </div>
  );
}

function PagedView({ pages }: { pages: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between bg-[#0a0a0a]/60 border border-[#2bd5d5]/20 rounded-lg p-2 sm:p-4">
        <button 
          onClick={() => setIndex(i => Math.max(0, i - 1))} 
          disabled={index === 0}
          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">← Previous</span>
          <span className="sm:hidden">←</span>
        </button>
        <div className="text-xs sm:text-sm text-[#93a9a9]">
          Page <span className="text-[#2bd5d5] font-bold">{index + 1}</span> of <span className="text-[#2bd5d5] font-bold">{pages.length}</span>
        </div>
        <button 
          onClick={() => setIndex(i => Math.min(pages.length - 1, i + 1))} 
          disabled={index === pages.length - 1}
          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next →</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>
      <div>
        <img 
          src={pages[index]} 
          alt={`page ${index + 1}`} 
          className="w-full rounded-lg shadow-lg" 
          onError={(e) => console.error(`Failed to load page ${index + 1}:`, pages[index], e)}
          onLoad={() => console.log(`Loaded page ${index + 1}`)}
        />
      </div>
    </div>
  );
}
