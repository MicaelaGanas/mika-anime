"use client"

import React, { useEffect, useState, useRef } from "react";
import { fetchJsonCached, clearFetchCache } from "../lib/fetchCache";

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
            const imgs = files.map((f: string) => `${base}/data/${hash}/${f}`);
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
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[#2bd5d5] hover:text-[#19bfbf] transition-colors font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chapters
          </button>
          
          <div className="flex items-center gap-2">
            {prevChapter && onRequestChapterChange && (
              <button
                onClick={() => onRequestChapterChange(prevChapter.id)}
                className="px-3 py-1.5 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
              >
                ← Prev
              </button>
            )}
            
            <button
              onClick={() => setMode(m => (m === "scroll" ? "paged" : "scroll"))}
              className="px-4 py-2 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
            >
              {mode === "scroll" ? "📖 Paged" : "📜 Scroll"}
            </button>
            
            {nextChapter && onRequestChapterChange && (
              <button
                onClick={() => onRequestChapterChange(nextChapter.id)}
                className="px-3 py-1.5 rounded-lg bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-all"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-20">
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
      </div>
    </div>
  );
}

function PagedView({ pages }: { pages: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between bg-[#0a0a0a]/60 border border-[#2bd5d5]/20 rounded-lg p-4">
        <button 
          onClick={() => setIndex(i => Math.max(0, i - 1))} 
          disabled={index === 0}
          className="px-4 py-2 bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded-lg font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <div className="text-sm text-[#93a9a9]">
          Page <span className="text-[#2bd5d5] font-bold">{index + 1}</span> of <span className="text-[#2bd5d5] font-bold">{pages.length}</span>
        </div>
        <button 
          onClick={() => setIndex(i => Math.min(pages.length - 1, i + 1))} 
          disabled={index === pages.length - 1}
          className="px-4 py-2 bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded-lg font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
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
