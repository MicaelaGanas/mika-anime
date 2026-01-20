"use client"

import React, { useEffect, useState, useRef } from "react";
import { fetchJsonCached } from "../lib/fetchCache";

export default function Reader({ chapterId, onClose, chapters, onRequestChapterChange }: { chapterId: string; onClose: () => void; chapters?: any[]; onRequestChapterChange?: (id: string) => void }) {
  const [pages, setPages] = useState<string[]>([]);
  const [mode, setMode] = useState<"scroll" | "paged">("scroll");
  const [loading, setLoading] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Controls are fixed and do not hide on scroll — no scroll handler needed.

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchJsonCached(`/api/chapter/${chapterId}`)
      .then((d) => {
        if (!mounted) return;
        // Validate response shape
        if (!d || d.error || !d.baseUrl || !d.chapter || !Array.isArray(d.chapter.data)) {
          console.warn('Invalid chapter server response for', chapterId, d);
          setPages([]);
          return;
        }
        const base = d.baseUrl;
        const chapter = d.chapter || {};
        const hash = chapter.hash;
        const files: string[] = chapter.data || [];
        const imgs = files.map((f: string) => `${base}/data/${hash}/${f}`);
        setPages(imgs);
      })
      .catch((err) => {
        console.error('Error fetching chapter server:', err);
        setPages([]);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [chapterId]);

  // Find previous/next chapter IDs when a chapters list is provided
  const currentIndex = (chapters || []).findIndex((c: any) => c.id === chapterId);
  const prevChapterId = currentIndex > -1 ? (chapters || [])[currentIndex - 1]?.id : undefined;
  const nextChapterId = currentIndex > -1 ? (chapters || [])[currentIndex + 1]?.id : undefined;
  const currentChapterObj = (chapters || []).find((c: any) => c.id === chapterId);
  const chapterLabel = currentChapterObj ? (currentChapterObj.attributes?.chapter ? `Ch ${currentChapterObj.attributes.chapter}` : (currentChapterObj.attributes?.title || "")) : "";

  // Prefetch next chapter metadata and first image to speed up navigation
  useEffect(() => {
    if (!nextChapterId) return;
    let mounted = true;
    (async () => {
      try {
        const meta = await fetchJsonCached(`/api/chapter/${nextChapterId}`);
        if (!mounted || !meta) return;
        if (meta.error || !meta.baseUrl || !meta.chapter || !Array.isArray(meta.chapter.data)) {
          return;
        }
        const base = meta.baseUrl;
        const chapter = meta.chapter || {};
        const hash = chapter.hash;
        const files: string[] = chapter.data || [];
        // Preload first 1-3 images
        files.slice(0, 3).forEach((f: string) => {
          const img = new Image();
          img.src = `${base}/data/${hash}/${f}`;
        });
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [nextChapterId]);

  // Track scroll position to show controls only when at top or near bottom
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const viewportBottom = window.innerHeight + y;
      const docHeight = document.documentElement?.scrollHeight || document.body.scrollHeight || 0;
      setIsAtTop(y < 80);
      setIsNearBottom(viewportBottom >= docHeight - 120);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (loading) return <div className="text-[#93a9a9] text-center py-8">Loading pages…</div>;
  if (pages.length === 0) return (
    <div className="text-[#93a9a9] text-center py-8">
      <div className="mb-2">This chapter isn't available to view here.</div>
      <a className="text-[#2bd5d5] underline" target="_blank" rel="noopener noreferrer" href={`https://mangadex.org/chapter/${chapterId}`}>Read on MangaDex</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#040506]">
      <div className="max-w-5xl mx-auto px-4 pt-6">{mode === "scroll" ? (
        <div className="space-y-2">
          {pages.map((p, i) => (
            <img key={i} src={p} alt={`page ${i + 1}`} className="w-full rounded-lg shadow-lg" />
          ))}
        </div>
      ) : (
        <PagedView pages={pages} />
      )}
      </div>

      {/* Bottom Chapter Controls - fixed and not part of scroll */}
      {(isAtTop || isNearBottom) && (
        <div className="fixed bottom-4 left-0 right-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-5xl w-full px-4">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 bg-[#0a0a0a]/60 border border-[#2bd5d5]/20 rounded-md p-2">
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (prevChapterId && onRequestChapterChange) onRequestChapterChange(prevChapterId);
                  }}
                  disabled={!prevChapterId}
                  className="w-full sm:w-auto px-2 py-1.5 text-xs bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded-md font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Prev Chapter
                </button>
              </div>

              <div className="text-xs text-[#93a9a9]">{chapterLabel} • {pages.length} pages</div>

              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (nextChapterId && onRequestChapterChange) onRequestChapterChange(nextChapterId);
                  }}
                  disabled={!nextChapterId}
                  className="w-full sm:w-auto px-2 py-1.5 text-xs bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] rounded-md font-semibold hover:bg-[#2bd5d5]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Chapter →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
        <img src={pages[index]} alt={`page ${index + 1}`} className="w-full rounded-lg shadow-lg" />
      </div>
    </div>
  );
}
