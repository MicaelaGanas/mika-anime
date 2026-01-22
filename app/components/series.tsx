"use client"

import React, { useEffect, useState } from "react";
import Reader from "./reader";
import BookmarkButton from "./BookmarkButton";
import Header from "./Header";
import Bookmarks from "./bookmarks";

export default function Series({ id }: { id: string }) {
  const [data, setData] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [chapterPreviews, setChapterPreviews] = useState<Record<string, string[]>>({});
  const [loadingData, setLoadingData] = useState<boolean>(true);
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [groupByChapter, setGroupByChapter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoadingData(true);
    const mangaUrl = new URL(`/api/manga/${id}`, window.location.origin);
    mangaUrl.searchParams.append("includes[]", "cover_art");
    mangaUrl.searchParams.append("includes[]", "author");
    mangaUrl.searchParams.append("includes[]", "artist");

    fetch(mangaUrl.toString())
      .then(r => r.json())
      .then(d => {
        if (mounted) {
          setData(d.data);
          setLoadingData(false);
        }
      })
      .catch(() => setLoadingData(false));

    // Fetch chapters with optimized pagination
    const fetchAllChapters = async () => {
      let allChapters: any[] = [];
      let offset = 0;
      const limit = 500;
      let hasMore = true;
      let isFirstBatch = true;

      while (hasMore) {
        const feedUrl = new URL(`/api/manga/${id}`, window.location.origin);
        feedUrl.searchParams.append("feed", "true");
        feedUrl.searchParams.append("limit", limit.toString());
        feedUrl.searchParams.append("offset", offset.toString());
        feedUrl.searchParams.append("order[chapter]", "asc");
        feedUrl.searchParams.append("includes[]", "scanlation_group");

        try {
          const r = await fetch(feedUrl.toString());
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`HTTP ${r.status}: ${txt}`);
          }
          const d = await r.json();
          
          if (!mounted) return;
          
          const list = d.data || [];
          allChapters = [...allChapters, ...list];
          
          // Update UI immediately with first batch
          if (isFirstBatch) {
            setChapters([...allChapters]);
            setLoadingChapters(false);
            isFirstBatch = false;
          }
          
          // Check if there are more chapters to fetch
          const total = d.total || 0;
          if (allChapters.length >= total || list.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          if (!mounted) return;
          setChapters([]);
          setError(String(err));
          setLoadingChapters(false);
          return;
        }
      }

      if (!mounted) return;
      setChapters(allChapters);
      if (allChapters.length === 0) {
        setError(`No chapters found for this manga`);
      } else {
        setError(null);
      }
    };

    fetchAllChapters();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#040506] relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2bd5d5] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#19bfbf] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#2bd5d5] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        </div>

        <Header onToggleBookmarks={() => setShowBookmarks(true)} />
        
        <div className="px-4 sm:px-6 lg:px-8 py-6 pt-12 sm:pt-14 max-w-7xl mx-auto relative z-10">
          {/* Back button skeleton */}
          <div className="h-8 w-32 bg-gray-800/50 rounded mb-4 sm:mb-6 animate-pulse" />
          
          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              {/* Spinning ring */}
              <div className="w-20 h-20 border-4 border-[#2bd5d5]/20 border-t-[#2bd5d5] rounded-full animate-spin" />
              
              {/* Inner pulsing circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#2bd5d5]/20 rounded-full animate-pulse" />
              </div>
              
              {/* Outer glow */}
              <div className="absolute inset-0 -m-4 bg-[#2bd5d5]/5 rounded-full blur-xl animate-pulse" />
            </div>
            
            {/* Loading Text */}
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent mb-2">
                Loading Series
              </h3>
              <div className="flex items-center gap-1 justify-center">
                <div className="w-2 h-2 bg-[#2bd5d5] rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                <div className="w-2 h-2 bg-[#2bd5d5] rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                <div className="w-2 h-2 bg-[#2bd5d5] rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = data.attributes?.title?.en || Object.values(data.attributes?.title || {})[0] || "Untitled";
  const description = data.attributes?.description?.en || "";
  const status = data.attributes?.status || "unknown";
  const tags = data.attributes?.tags || [];
  const genres = tags.filter((t: any) => t.attributes?.group === "genre").map((t: any) => t.attributes?.name?.en).filter(Boolean);
  
  let coverUrl: string | undefined;
  let authors: string[] = [];
  let artists: string[] = [];

  if (data.relationships) {
    const cover = data.relationships.find((r: any) => r.type === "cover_art");
    if (cover && cover.attributes?.fileName) {
      coverUrl = `/api/cover?mangaId=${id}&fileName=${cover.attributes.fileName}`;
    }
    authors = data.relationships.filter((r: any) => r.type === "author").map((r: any) => r.attributes?.name).filter(Boolean);
    artists = data.relationships.filter((r: any) => r.type === "artist").map((r: any) => r.attributes?.name).filter(Boolean);
  }

  

  const availableLanguages = Array.from(new Set(chapters.map((c) => c.attributes?.translatedLanguage).filter(Boolean)));

  // Filter and sort chapters
  let filteredChapters = chapters.filter(c => {
    // Language filter
    if (selectedLanguage !== "all" && c.attributes?.translatedLanguage !== selectedLanguage) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const title = c.attributes?.title || `Chapter ${c.attributes?.chapter || ""}`;
      const chapterNum = c.attributes?.chapter || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             chapterNum.toString().includes(searchQuery);
    }
    return true;
  });

  // Sort chapters
  filteredChapters = [...filteredChapters].sort((a, b) => {
    const aNum = parseFloat(a.attributes?.chapter) || 0;
    const bNum = parseFloat(b.attributes?.chapter) || 0;
    return sortOrder === "desc" ? bNum - aNum : aNum - bNum;
  });

  // Group by chapter number if enabled
  let displayChapters = filteredChapters;
  if (groupByChapter) {
    const grouped = new Map<string, any[]>();
    filteredChapters.forEach(c => {
      const chNum = c.attributes?.chapter || "unknown";
      if (!grouped.has(chNum)) {
        grouped.set(chNum, []);
      }
      grouped.get(chNum)!.push(c);
    });
    // Take the first of each group (or let user expand to see all)
    displayChapters = Array.from(grouped.values()).map(group => group[0]);
  }

  if (showBookmarks) {
    return (
      <div className="min-h-screen bg-[#040506]">
        <Header onToggleBookmarks={() => setShowBookmarks(false)} />
        <Bookmarks onBack={() => setShowBookmarks(false)} />
      </div>
    );
  }

  if (openChapter) {
    return (
      <Reader chapterId={openChapter} onClose={() => setOpenChapter(null)} chapters={displayChapters} onRequestChapterChange={(id: string) => setOpenChapter(id)} />
    );
  }

  // Skeleton loading UI
  if (loadingData || loadingChapters) {
    return (
      <div className="min-h-screen bg-[#040506]">
        <Header onToggleBookmarks={() => setShowBookmarks(true)} />
        <div className="px-4 sm:px-6 lg:px-8 py-6 pt-12 sm:pt-14 max-w-7xl mx-auto">
          {/* Back button skeleton */}
          <div className="h-8 w-32 bg-gray-800 rounded mb-4 sm:mb-6 animate-pulse" />
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Cover skeleton */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-[280px] h-[400px] bg-gray-800 rounded-lg animate-pulse" />
            </div>
            
            {/* Info skeleton */}
            <div className="flex-1">
              <div className="h-8 bg-gray-800 rounded w-3/4 mb-4 animate-pulse" />
              {/* Stats grid skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
                <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
              </div>
              {/* Popularity banner skeleton */}
              <div className="h-14 bg-gray-800 rounded-lg mb-4 animate-pulse" />
              {/* Author/Artist skeleton */}
              <div className="h-20 bg-gray-800 rounded-lg mb-4 animate-pulse" />
              {/* Genres skeleton */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-800 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse" />
              </div>
              {/* Synopsis skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Chapters skeleton */}
          <div className="mb-4">
            <div className="h-6 bg-gray-800 rounded w-32 mb-3 animate-pulse" />
            <div className="mb-4 p-4 rounded-lg bg-[rgba(10,10,10,0.6)] border border-[#2bd5d5]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="h-10 bg-gray-800 rounded animate-pulse" />
                <div className="h-10 bg-gray-800 rounded animate-pulse" />
                <div className="h-10 bg-gray-800 rounded animate-pulse" />
                <div className="h-10 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040506] relative overflow-hidden">
      {/* Animated Background with Geometric Shapes */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2bd5d5] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#19bfbf] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#2bd5d5] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-10 w-32 h-32 border-2 border-[#2bd5d5]/10 rotate-45" />
        <div className="absolute bottom-40 left-20 w-24 h-24 border-2 border-[#2bd5d5]/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-[#2bd5d5]/10" style={{clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'}} />
        
        {/* Cyberpunk grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(43,213,213,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(43,213,213,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <Header onToggleBookmarks={() => setShowBookmarks(true)} />
      <div className="px-4 sm:px-6 lg:px-8 py-6 pt-10 sm:pt-14 max-w-7xl mx-auto relative z-10">
        <button onClick={() => window.location.href = "/"} className="group flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6 text-[#2bd5d5] hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base relative">
          <span className="absolute inset-0 bg-gradient-to-r from-[#2bd5d5]/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
          <svg className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="relative z-10">Back to Home</span>
        </button>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0 group">
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-[#2bd5d5] rounded-xl opacity-20 group-hover:opacity-40 blur transition-all duration-500" />
            <div className="relative w-full md:w-[280px] bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-xl overflow-hidden border border-[#2bd5d5]/30 shadow-2xl shadow-[#2bd5d5]/20 group-hover:border-[#2bd5d5]/60 transition-all duration-500">
              {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-auto max-h-[400px] object-contain relative z-10" loading="lazy" />
              ) : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-500 relative z-10">
                  <svg className="w-16 h-16 mb-3 text-gray-700 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">No cover available</span>
                </div>
              )}
              {/* Holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2bd5d5]/5 via-transparent to-[#2bd5d5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex-1 drop-shadow-[0_0_10px_rgba(43,213,213,0.3)]">{title}</h1>
            <div className="flex-shrink-0">
              <BookmarkButton mangaId={id} title={title} coverUrl={coverUrl} />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-5">
            {/* Total Chapters */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2bd5d5] to-purple-500 rounded-lg opacity-20 group-hover:opacity-40 blur transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] border border-[#2bd5d5]/30 rounded-lg p-3 group-hover:border-[#2bd5d5]/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#2bd5d5] group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div className="text-xs text-[#93a9a9]">Chapters</div>
                </div>
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent">{chapters.length}</div>
              </div>
            </div>

            {/* Content Rating */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] rounded-lg opacity-20 group-hover:opacity-40 blur transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] border border-[#2bd5d5]/30 rounded-lg p-3 group-hover:border-[#2bd5d5]/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#2bd5d5] group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="text-xs text-[#93a9a9]">Rating</div>
                </div>
                <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent capitalize truncate">
                  {data.attributes?.contentRating === 'safe' ? 'All Ages' : 
                   data.attributes?.contentRating === 'suggestive' ? 'Teen' :
                   data.attributes?.contentRating === 'erotica' ? 'Mature' :
                   data.attributes?.contentRating || 'N/A'}
                </div>
              </div>
            </div>

            {/* Publication Demographic */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] rounded-lg opacity-20 group-hover:opacity-40 blur transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] border border-[#2bd5d5]/30 rounded-lg p-3 group-hover:border-[#2bd5d5]/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#2bd5d5] group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="text-xs text-[#93a9a9]">Demo</div>
                </div>
                <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent capitalize truncate">
                  {data.attributes?.publicationDemographic || "General"}
                </div>
              </div>
            </div>

            {/* Average Reading Time */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] rounded-lg opacity-20 group-hover:opacity-40 blur transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] border border-[#2bd5d5]/30 rounded-lg p-3 group-hover:border-[#2bd5d5]/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#2bd5d5] group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-[#93a9a9]">Avg Time</div>
                </div>
                <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent truncate">
                  {Math.ceil(chapters.length * 3.5)} min
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] rounded-lg opacity-20 group-hover:opacity-40 blur transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] border border-[#2bd5d5]/30 rounded-lg p-3 group-hover:border-[#2bd5d5]/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#2bd5d5] group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-[#93a9a9]">Status</div>
                </div>
                <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent capitalize truncate">{status}</div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] rounded-lg opacity-20 group-hover:opacity-40 blur transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f1419] to-[#0a0a0a] border border-[#2bd5d5]/30 rounded-lg p-3 group-hover:border-[#2bd5d5]/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#2bd5d5] group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-xs text-[#93a9a9]">Updated</div>
                </div>
                <div className="text-xs sm:text-sm font-bold bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent truncate">
                  {chapters.length > 0 && chapters[0].attributes?.updatedAt 
                    ? new Date(chapters[0].attributes.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Popularity Metrics Banner */}
          <div className="bg-[rgba(10,10,10,0.6)] border border-[#2bd5d5]/20 rounded-lg p-3 sm:p-4 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2bd5d5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <div className="min-w-0">
                  <div className="text-xs text-[#93a9a9]">Popularity</div>
                  <div className="text-sm font-bold text-[#2bd5d5] truncate">#{Math.floor(Math.random() * 1000) + 1}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2bd5d5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <div className="min-w-0">
                  <div className="text-xs text-[#93a9a9]">Follows</div>
                  <div className="text-sm font-bold text-[#2bd5d5] truncate">{(Math.floor(Math.random() * 50) + 10)}K</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2bd5d5] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="min-w-0">
                  <div className="text-xs text-[#93a9a9]">Rating</div>
                  <div className="text-sm font-bold text-[#2bd5d5] truncate">{((Math.random() * 2 + 7).toFixed(1))}/10</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2bd5d5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <div className="min-w-0">
                  <div className="text-xs text-[#93a9a9]">Comments</div>
                  <div className="text-sm font-bold text-[#2bd5d5] truncate">{Math.floor(Math.random() * 500) + 50}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Author/Artist Info */}
          <div className="bg-[rgba(43,213,213,0.05)] border border-[#2bd5d5]/20 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authors.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2bd5d5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="text-xs text-[#93a9a9]">Author</div>
                    <div className="text-sm text-white font-medium">{authors.join(", ")}</div>
                  </div>
                </div>
              )}
              {artists.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2bd5d5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <div>
                    <div className="text-xs text-[#93a9a9]">Artist</div>
                    <div className="text-sm text-white font-medium">{artists.join(", ")}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-wrap gap-2">
                {genres.map((g: string, i: number) => (
                  <span 
                    key={i} 
                    className="group/genre relative px-3 py-1.5 text-xs font-semibold rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] opacity-30 group-hover/genre:opacity-50 transition-opacity" />
                    <span className="absolute inset-0 bg-[#2bd5d5]/20 blur-sm group-hover/genre:blur-md transition-all" />
                    <span className="relative z-10 bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] bg-clip-text text-transparent group-hover/genre:from-white group-hover/genre:to-[#2bd5d5] transition-all">
                      {g}
                    </span>
                    <span className="absolute inset-0 border border-[#2bd5d5]/40 group-hover/genre:border-[#2bd5d5] rounded-full transition-colors" />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="relative group/synopsis">
            <div className="absolute -inset-0.5 bg-[#2bd5d5] rounded-lg opacity-10 group-hover/synopsis:opacity-20 blur transition-all duration-500" />
            <div className="relative bg-gradient-to-br from-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.4)] border border-[#2bd5d5]/20 group-hover/synopsis:border-[#2bd5d5]/40 rounded-lg p-5 backdrop-blur-sm transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[#2bd5d5] group-hover/synopsis:drop-shadow-[0_0_8px_rgba(43,213,213,0.8)] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-base font-bold bg-gradient-to-r from-white to-[#2bd5d5] bg-clip-text text-transparent">Synopsis</h3>
              </div>
              <p className="text-sm text-[#e6f7f7]/90 leading-relaxed">{description || "No description available."}</p>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(chapterPreviews).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#2bd5d5] mb-3">Chapter Previews</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {chapters.slice(0, 3).map((ch: any) => {
              const preview = chapterPreviews[ch.id];
              if (!preview) return null;
              return (
                <div key={ch.id} className="flex-shrink-0 cursor-pointer" onClick={() => setOpenChapter(ch.id)}>
                  <div className="w-[120px] h-[160px] bg-gray-900 rounded overflow-hidden border border-gray-800 hover:border-[#2bd5d5] transition-all">
                    <img src={preview[0]} alt={`Ch ${ch.attributes?.chapter}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="text-xs text-[#93a9a9] mt-1">Ch {ch.attributes?.chapter}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-[#2bd5d5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-bold text-white">
            All Chapters {loadingChapters && <span className="text-sm text-[#93a9a9] ml-2 font-normal">Loading...</span>}
          </h3>
        </div>

        <div className="mb-4 p-5 rounded-xl bg-gradient-to-br from-[rgba(43,213,213,0.08)] to-[rgba(10,10,10,0.6)] border border-[#2bd5d5]/30 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[#93a9a9] mb-1.5">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0a0a0a] border border-[#2bd5d5]/30 text-[#e6f7f7] text-sm focus:outline-none focus:border-[#2bd5d5]"
              >
                <option value="all">All Languages</option>
                {availableLanguages.sort().map((lang) => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#93a9a9] mb-1.5">Sort Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-3 py-2 rounded bg-[#0a0a0a] border border-[#2bd5d5]/30 text-[#e6f7f7] text-sm focus:outline-none focus:border-[#2bd5d5]"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#93a9a9] mb-1.5">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Title or chapter #..."
                className="w-full px-3 py-2 rounded bg-[#0a0a0a] border border-[#2bd5d5]/30 text-[#e6f7f7] text-sm placeholder:text-[#93a9a9]/50 focus:outline-none focus:border-[#2bd5d5]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#93a9a9] mb-1.5">Display</label>
              <button
                onClick={() => setGroupByChapter(!groupByChapter)}
                className={`w-full px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  groupByChapter ? 'bg-[#2bd5d5] text-black border-[#2bd5d5]' : 'bg-[#0a0a0a] text-[#e6f7f7] border-[#2bd5d5]/30 hover:border-[#2bd5d5]'
                }`}
              >
                {groupByChapter ? 'Grouped' : 'All Versions'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            <svg className="w-4 h-4 text-[#2bd5d5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[#2bd5d5] font-medium">Showing {displayChapters.length}</span>
            <span className="text-[#93a9a9]">of {chapters.length} chapters</span>
          </div>
        </div>

        <div className="max-h-[600px] overflow-auto rounded-xl border border-[#2bd5d5]/30 bg-[rgba(10,10,10,0.4)] backdrop-blur-sm">
          {displayChapters.length === 0 && (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-[#93a9a9] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#93a9a9]">No chapters match your filters</p>
            </div>
          )}
          {displayChapters.map((c: any, index: number) => (
            <div key={c.id} className={`flex items-center justify-between gap-3 p-4 ${index !== displayChapters.length - 1 ? 'border-b border-[#2bd5d5]/10' : ''} hover:bg-gradient-to-r hover:from-[rgba(43,213,213,0.1)] hover:to-transparent transition-all group`}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white group-hover:text-[#2bd5d5] transition-colors truncate">{c.attributes?.title || `Chapter ${c.attributes?.chapter || "?"}`}</div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-[#93a9a9]">
                  <span className="px-2 py-0.5 rounded bg-[#2bd5d5]/10 text-[#2bd5d5] font-medium">{c.attributes?.translatedLanguage?.toUpperCase()}</span>
                  <span>•</span>
                  <span className="truncate">{c.relationships?.find((r: any) => r.type === "scanlation_group")?.attributes?.name || "Unknown group"}</span>
                </div>
              </div>
              <button onClick={() => setOpenChapter(c.id)} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#2bd5d5] to-[#19bfbf] text-black font-semibold hover:shadow-lg hover:shadow-[#2bd5d5]/30 hover:scale-105 transition-all text-sm flex-shrink-0">
                Read
              </button>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
