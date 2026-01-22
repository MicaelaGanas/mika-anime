"use client"

import React, { useEffect, useState } from "react";
import Header from "./Header";
import Bookmarks from "./bookmarks";
import Series from "./series";
import Footer from "./Footer";
import LazyImage from "./LazyImage";

type PosterCardProps = { manga: any; onClick: () => void; delay?: number };

function getCoverUrl(manga: any): string | undefined {
  const cover = manga.relationships?.find((r: any) => r.type === "cover_art");
  if (!cover?.attributes?.fileName) return undefined;
  return `/api/cover?mangaId=${manga.id}&fileName=${cover.attributes.fileName}`;
}

function PosterCard({ manga, onClick, delay = 0 }: PosterCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const title = manga.attributes?.title?.en || Object.values(manga.attributes?.title || {})[0] || "Untitled";
  const status = manga.attributes?.status || "unknown";
  const year = manga.attributes?.year;
  const tags = manga.attributes?.tags || [];
  const topGenre = tags.find((t: any) => t.attributes?.group === "genre")?.attributes?.name?.en;
  const coverUrl = getCoverUrl(manga);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div onClick={onClick} className={`cursor-pointer group transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="relative w-[120px] sm:w-[150px] md:w-[180px] h-[170px] sm:h-[215px] md:h-[260px] rounded-lg sm:rounded-xl overflow-hidden border border-gray-800 group-hover:border-[#2bd5d5] group-hover:shadow-2xl group-hover:shadow-[#2bd5d5]/30 transition-all duration-300">
        <div className="absolute inset-0">
          <LazyImage 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            fallback={<div className="w-full h-full bg-gray-900 flex items-center justify-center text-sm text-gray-500">No cover</div>}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[10px] font-bold rounded-full uppercase tracking-wide ${
            status === "ongoing" ? "bg-green-500/90 text-white" : status === "completed" ? "bg-blue-500/90 text-white" : "bg-gray-500/90 text-white"
          }`}>{status}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-10">
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1 drop-shadow-lg group-hover:text-[#2bd5d5] transition-colors">{title}</h3>
          <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] text-gray-300">
            {year && <span className="font-semibold">{year}</span>}
            {topGenre && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="px-1 sm:px-1.5 py-0.5 bg-[#2bd5d5]/20 text-[#2bd5d5] rounded text-[7px] sm:text-[10px]">{topGenre}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Library({ section = "popular", onNavigateHome }: { section?: "popular" | "latest" | "browse"; onNavigateHome?: () => void }) {
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [manga, setManga] = useState<any[]>([]);
  const [selectedManga, setSelectedManga] = useState<string | null>(null);
  const [librarySection, setLibrarySection] = useState<"popular" | "latest" | "browse" | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = section === "browse" ? 36 : 24;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setOffset(0);
    setManga([]);

    const url = new URL("/api/manga", window.location.origin);
    
    if (section === "popular") {
      url.searchParams.append("limit", String(LIMIT));
      url.searchParams.append("order[followedCount]", "desc");
    } else if (section === "latest") {
      url.searchParams.append("limit", String(LIMIT));
      url.searchParams.append("order[latestUploadedChapter]", "desc");
    } else if (section === "browse") {
      url.searchParams.append("limit", String(LIMIT));
      url.searchParams.append("order[createdAt]", "desc");
    }
    
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.append("contentRating[]", "safe");
    url.searchParams.append("contentRating[]", "suggestive");
    
    fetch(url)
      .then(r => r.json())
      .then(d => { 
        if (mounted) {
          const data = d.data || [];
          setManga(data);
          setHasMore(d.total > LIMIT);
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [section, LIMIT]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setLoadingMore(true);

    const url = new URL("/api/manga", window.location.origin);
    url.searchParams.append("limit", String(LIMIT));
    url.searchParams.append("offset", String(newOffset));
    
    if (section === "popular") {
      url.searchParams.append("order[followedCount]", "desc");
    } else if (section === "latest") {
      url.searchParams.append("order[latestUploadedChapter]", "desc");
    } else if (section === "browse") {
      url.searchParams.append("order[createdAt]", "desc");
    }
    
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.append("contentRating[]", "safe");
    url.searchParams.append("contentRating[]", "suggestive");
    
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const newData = d.data || [];
        setManga(prev => [...prev, ...newData]);
        setOffset(newOffset);
        setHasMore(newOffset + LIMIT < d.total);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  };

  if (showBookmarks) {
    return (
      <div className="min-h-screen bg-[#040506]">
        <Header onToggleBookmarks={() => setShowBookmarks(false)} />
        <div className="pt-20 sm:pt-24 max-w-7xl mx-auto px-2 sm:px-4 pb-6 sm:pb-12">
          <Bookmarks onBack={() => setShowBookmarks(false)} />
        </div>
      </div>
    );
  }

  if (librarySection && librarySection !== section) {
    return <Library section={librarySection} onNavigateHome={onNavigateHome} />;
  }

  if (selectedManga) {
    return <Series id={selectedManga} />;
  }

  const getTitle = () => {
    if (section === "popular") return "Popular Manga";
    if (section === "latest") return "Latest Updates";
    return "Browse All";
  };

  const getIcon = () => {
    if (section === "popular") {
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    if (section === "latest") {
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#040506] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2bd5d5] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#19bfbf] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#2bd5d5] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <Header 
        onToggleBookmarks={() => setShowBookmarks(true)}
        onNavigateHome={onNavigateHome}
        onNavigatePopular={() => setLibrarySection("popular")}
        onNavigateLatest={() => setLibrarySection("latest")}
        onNavigateBrowse={() => setLibrarySection("browse")}
        activePage={section}
      />

      <div className="relative z-10 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-6 sm:pb-12">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[#2bd5d5]">
                {getIcon()}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent">
                {getTitle()}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#93a9a9]">Discover amazing manga series</p>
          </div>

          {/* Manga Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {loading && manga.length === 0 ? (
              [...Array(24)].map((_, i) => (
                <div key={i} className="w-full h-[170px] sm:h-[215px] md:h-[260px] bg-gray-800 rounded-lg sm:rounded-xl animate-pulse" />
              ))
            ) : (
              manga.map((m, i) => (
                <PosterCard key={m.id} manga={m} onClick={() => setSelectedManga(m.id)} delay={i * 20} />
              ))
            )}
          </div>

          {/* Load More Button */}
          {!loading && hasMore && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-lg bg-[#2bd5d5]/10 border-2 border-[#2bd5d5]/30 text-[#2bd5d5] font-bold hover:bg-[#2bd5d5]/20 hover:border-[#2bd5d5]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2bd5d5]"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer 
        onNavigatePopular={() => setLibrarySection("popular")} 
        onNavigateLatest={() => setLibrarySection("latest")} 
        onNavigateBrowse={() => setLibrarySection("browse")} 
        onNavigateBookmarks={() => setShowBookmarks(true)} 
        onNavigateAbout={() => {/* Navigate to about - will need parent callback */}}
      />
    </div>
  );
}
