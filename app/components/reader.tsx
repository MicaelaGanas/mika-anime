"use client"

import React, { useEffect, useState, useRef } from "react";
import { fetchJsonCached, clearFetchCache } from "../lib/fetchCache";
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
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    clearFetchCache();
    
    const fetchWithRetry = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const d = await fetchJsonCached(`/api/chapter/${chapterId}`);
          
          if (!mounted) return;
          
          if (d?.error) {
            console.error('API returned error:', d.error, d.details);
            if (i < retries) {
              await new Promise(r => setTimeout(r, 1000 * (i + 1)));
              continue;
            }
            setPages([]);
            return;
          }
          
          const base = d.baseUrl;
          const chapter = d.chapter || {};
          const hash = chapter.hash;
          const files: string[] = chapter.data || [];
          
          if (base && hash && files && files.length > 0) {
            const imgs = files.map((f: string) => {
              const originalUrl = `${base}/data/${hash}/${f}`;
              return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
            });
            setPages(imgs);
            return;
          } else {
            console.warn('Missing required fields:', { hasBase: !!base, hasHash: !!hash, filesCount: files?.length });
            setPages([]);
            return;
          }
        } catch (err) {
          console.error(`Error fetching chapter (attempt ${i + 1}):`, err);
          if (i < retries) {
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
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

  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  const currentChapter = chapters[currentIndex];
  
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
        <Bookmarks onBack={() => setShowBookmarks(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040506] pb-12">
        <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black via-black/95 to-transparent border-b border-[#2bd5d5]/20 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="text-center mb-2 sm:mb-3">
              <div className="h-6 bg-gray-800 rounded w-64 mx-auto animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-2 sm:px-4 pt-32 sm:pt-36">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full h-96 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pages.length === 0) return (
    <div className="text-[#93a9a9] text-center py-8">
      <div className="mb-2">This chapter isn't available to view here.</div>
      <a className="text-[#2bd5d5] underline" target="_blank" rel="noopener noreferrer" href={`https://mangadex.org/chapter/${chapterId}`}>Read on MangaDex</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#040506] pb-12">
      {/* Floating Back Button - Top Left */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-50 p-2 sm:p-3 rounded-full bg-black/80 backdrop-blur-sm border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-black/90 hover:border-[#2bd5d5] transition-all shadow-lg"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Chapter Info - Top Center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 sm:px-4 py-2 rounded-full bg-black/80 backdrop-blur-sm border border-[#2bd5d5]/30 max-w-xs sm:max-w-md">
        <p className="text-xs sm:text-sm font-semibold text-[#e6f7f7] truncate text-center">{getChapterLabel()}</p>
      </div>

      {/* Mode Toggle - Top Right */}
      <button
        onClick={() => setMode(m => (m === "scroll" ? "paged" : "scroll"))}
        className="fixed top-4 right-4 z-50 px-3 sm:px-4 py-2 rounded-full bg-black/80 backdrop-blur-sm border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs sm:text-sm font-semibold hover:bg-black/90 hover:border-[#2bd5d5] transition-all shadow-lg"
      >
        {mode === "scroll" ? "📖 Paged" : "📜 Scroll"}
      </button>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 pt-20">
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
        <div className="mt-8 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-black/60 backdrop-blur-sm border border-[#2bd5d5]/30 rounded-xl">
          <button
            onClick={() => onRequestChapterChange && prevChapter && onRequestChapterChange(prevChapter.id)}
            disabled={!prevChapter || !onRequestChapterChange}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous Chapter
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
          >
            All Chapters
          </button>
          <button
            onClick={() => onRequestChapterChange && nextChapter && onRequestChapterChange(nextChapter.id)}
            disabled={!nextChapter || !onRequestChapterChange}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
