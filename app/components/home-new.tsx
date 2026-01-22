"use client"

import React, { useEffect, useState } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Browse from "./browse";
import Bookmarks from "./bookmarks";
import Series from "./series";
import Library from "./library";
import About from "./About";
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

export default function Home() {
  const [query, setQuery] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [librarySection, setLibrarySection] = useState<"popular" | "latest" | "browse" | null>(null);
  const [popular, setPopular] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [selectedManga, setSelectedManga] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    setIsSearchMode(!!q);
    setSelectedGenre(null);
    setSelectedManga(null);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setIsSearchMode(false);
    setQuery("");
    setSelectedManga(null);
  };

  const handleBackToHome = () => {
    setIsSearchMode(false);
    setSelectedGenre(null);
    setQuery("");
    setShowBookmarks(false);
    setShowAbout(false);
  };

  useEffect(() => {
    let mounted = true;
    const popUrl = new URL("/api/manga", window.location.origin);
    popUrl.searchParams.set("limit", "12");
    popUrl.searchParams.set("includes[]", "cover_art");
    popUrl.searchParams.set("order[followedCount]", "desc");
    popUrl.searchParams.set("contentRating[]", "safe");
    popUrl.searchParams.set("contentRating[]", "suggestive");

    fetch(popUrl.toString())
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (!mounted) return;
        const data = d.data || [];
        setPopular(data);
      })
      .catch((error) => {
        console.error('Failed to fetch popular manga:', error);
        setPopular([]);
      });

    const newUrl = new URL("/api/manga", window.location.origin);
    newUrl.searchParams.set("limit", "12");
    newUrl.searchParams.set("includes[]", "cover_art");
    newUrl.searchParams.set("order[createdAt]", "desc");
    newUrl.searchParams.set("contentRating[]", "safe");
    newUrl.searchParams.set("contentRating[]", "suggestive");

    fetch(newUrl.toString())
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(d => mounted && setLatest(d.data || []))
      .catch((error) => {
        console.error('Failed to fetch latest manga:', error);
        setLatest([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (popular.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % Math.min(popular.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [popular.length]);

  const featured = popular[featuredIndex];
  const getFeaturedCover = () => getCoverUrl(featured);
  const featuredTitle = featured?.attributes?.title?.en || Object.values(featured?.attributes?.title || {})[0] || "";
  const featuredDesc = featured?.attributes?.description?.en || "";

  if (librarySection) {
    return <Library section={librarySection} onNavigateHome={() => setLibrarySection(null)} />;
  }

  if (showAbout) {
    return (
      <div className="min-h-screen bg-[#040506] text-[#e6f7f7]">
        <Header 
          onToggleBookmarks={() => setShowBookmarks(s => !s)} 
          onSearch={handleSearch} 
          onGenreSelect={handleGenreSelect}
          onNavigateHome={handleBackToHome}
          onNavigatePopular={() => setLibrarySection("popular")}
          onNavigateLatest={() => setLibrarySection("latest")}
          onNavigateBrowse={() => setLibrarySection("browse")}
          activePage="home"
        />
        <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-20 sm:pt-24">
          <About />
        </main>
        <Footer 
          onNavigatePopular={() => setLibrarySection("popular")} 
          onNavigateLatest={() => setLibrarySection("latest")} 
          onNavigateBrowse={() => setLibrarySection("browse")} 
          onNavigateBookmarks={() => setShowBookmarks(true)}
          onNavigateAbout={() => setShowAbout(true)}
        />
      </div>
    );
  }

  if (selectedManga) {
    return (
      <div className="min-h-screen bg-[#040506] text-[#e6f7f7]">
        <Header 
          onToggleBookmarks={() => setShowBookmarks(s => !s)} 
          onSearch={handleSearch} 
          onGenreSelect={handleGenreSelect}
          onNavigateHome={handleBackToHome}
          onNavigatePopular={() => setLibrarySection("popular")}
          onNavigateLatest={() => setLibrarySection("latest")}
          onNavigateBrowse={() => setLibrarySection("browse")}
        />
        <main className="max-w-7xl mx-auto p-2 sm:p-4 pt-20 sm:pt-24">
          <Series id={selectedManga} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040506] text-[#e6f7f7]">
      <Header 
        onToggleBookmarks={() => setShowBookmarks(s => !s)} 
        onSearch={handleSearch} 
        onGenreSelect={handleGenreSelect}
        onNavigateHome={handleBackToHome}
        onNavigatePopular={() => setLibrarySection("popular")}
        onNavigateLatest={() => setLibrarySection("latest")}
        onNavigateBrowse={() => setLibrarySection("browse")}
        activePage="home"
      />
      
      {showBookmarks && (
        <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-20 sm:pt-24">
          <Bookmarks />
        </main>
      )}
      
      {!showBookmarks && (isSearchMode || selectedGenre) && (
        <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-20 sm:pt-24">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2bd5d5]">
              {selectedGenre ? `Genre: ${selectedGenre}` : `Search: "${query}"`}
            </h2>
          </div>
          <Browse query={selectedGenre || query} onSelectManga={setSelectedManga} genreMode={!!selectedGenre} selectedGenre={selectedGenre || undefined} hideFilters={true} />
        </main>
      )}
      
      {!showBookmarks && !isSearchMode && !selectedGenre && (
        <>
          {/* Hero Banner Skeleton or Content */}
          {popular.length === 0 ? (
            <section className="relative h-[300px] md:h-[450px] lg:h-[600px] mb-6 md:mb-12 overflow-hidden mt-16 md:mt-20">
              <div className="absolute inset-0 bg-gray-900/50 animate-pulse" />
              <div className="relative z-20 max-w-7xl mx-auto h-full flex items-center gap-3 md:gap-6 lg:gap-8 px-3 md:px-6 lg:px-8">
                <div className="flex-1 max-w-2xl space-y-1.5 md:space-y-3 lg:space-y-4">
                  <div className="h-6 md:h-8 w-32 md:w-48 bg-gray-800 rounded-full animate-pulse" />
                  <div className="h-8 md:h-16 lg:h-20 w-3/4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-16 md:h-24 w-full bg-gray-800 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 md:h-12 w-24 md:w-32 bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-8 md:h-12 w-24 md:w-32 bg-gray-800 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-shrink-0 w-[100px] md:w-[180px] lg:w-[280px] h-[140px] md:h-[270px] lg:h-[400px] bg-gray-800 rounded-xl animate-pulse" />
              </div>
            </section>
          ) : featured && (
            <section className="relative h-[300px] md:h-[450px] lg:h-[600px] mb-6 md:mb-12 overflow-hidden mt-16 md:mt-20">
              {/* Background image using img tag instead of background-image for proper proxying */}
              <div className="absolute inset-0 overflow-hidden">
                <LazyImage
                  key={featuredIndex}
                  src={getFeaturedCover()}
                  alt={featuredTitle}
                  className="w-full h-full object-cover blur-md scale-110 opacity-40 animate-fadeIn"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-l from-black via-black/90 to-black/60 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              
              <div className="absolute top-10 md:top-20 right-20 md:right-40 w-16 md:w-32 h-16 md:h-32 border border-[#2bd5d5]/20 md:border-2 rounded-lg rotate-12 z-10" />
              <div className="absolute top-1/2 left-1/4 w-8 md:w-16 h-8 md:h-16 bg-[#2bd5d5]/10 rounded-lg rotate-45 z-10" />
              <div className="absolute bottom-10 md:bottom-20 right-1/4 w-12 md:w-20 h-12 md:h-20 border border-[#2bd5d5]/15 md:border-2 rounded-lg -rotate-12 z-10" />
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2bd5d5]/50 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2bd5d5]/50 to-transparent z-10" />
              
              <div className="relative z-20 max-w-7xl mx-auto h-full flex items-center gap-3 md:gap-6 lg:gap-8 px-3 md:px-6 lg:px-8">
                <div key={`text-${featuredIndex}`} className="flex-1 max-w-2xl space-y-1.5 md:space-y-3 lg:space-y-4 animate-slideIn">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-[#2bd5d5]/30 blur-xl rounded-full" />
                    <div className="relative inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 lg:px-4 py-0.5 md:py-1 lg:py-1.5 bg-[#2bd5d5]/20 border border-[#2bd5d5] rounded-full text-[8px] md:text-[10px] lg:text-xs font-semibold text-[#2bd5d5] uppercase tracking-wider">
                      <svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured • Most Popular
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-2 md:-left-4 top-0 w-0.5 md:w-1 h-full bg-gradient-to-b from-[#2bd5d5] to-transparent rounded-full" />
                    <h1 className="text-xl md:text-4xl lg:text-6xl font-black text-white drop-shadow-2xl leading-tight">
                      {featuredTitle}
                    </h1>
                  </div>
                  
                  <div className="relative p-1.5 md:p-3 lg:p-4 bg-black/40 backdrop-blur-sm border-l-2 md:border-l-3 lg:border-l-4 border-[#2bd5d5] rounded-r-lg">
                    <p className="text-[10px] md:text-sm lg:text-lg text-gray-300 line-clamp-2 lg:line-clamp-3">{featuredDesc.slice(0, 200)}...</p>
                  </div>
                  
                  <div className="flex gap-1.5 md:gap-2 lg:gap-3 pt-1.5 md:pt-3 lg:pt-4">
                    <button 
                      onClick={() => setSelectedManga(featured.id)}
                      className="group relative px-2.5 md:px-4 lg:px-6 py-1.5 md:py-2 lg:py-3 bg-[#2bd5d5] text-black font-bold text-[10px] md:text-sm lg:text-base rounded-full hover:bg-[#19bfbf] transition-all hover:scale-105 shadow-lg shadow-[#2bd5d5]/30 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                      <span className="relative flex items-center gap-1 md:gap-1.5 lg:gap-2">
                        <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        Read Now
                      </span>
                    </button>
                    <button 
                      onClick={() => setSelectedManga(featured.id)}
                      className="px-2.5 md:px-4 lg:px-6 py-1.5 md:py-2 lg:py-3 bg-white/10 backdrop-blur-sm text-white font-semibold text-[10px] md:text-sm lg:text-base rounded-full hover:bg-white/20 transition-all border-2 border-white/20 hover:border-[#2bd5d5]/50"
                    >
                      More Info
                    </button>
                  </div>
                </div>
                
                <div key={`cover-${featuredIndex}`} className="flex-shrink-0 animate-slideIn relative" style={{ animationDelay: '0.1s' }}>
                  <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-12 md:w-16 lg:w-24 h-12 md:h-16 lg:h-24 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-[#2bd5d5] rounded-tr-3xl" />
                  <div className="absolute -bottom-2 md:-bottom-4 -left-2 md:-left-4 w-12 md:w-16 lg:w-24 h-12 md:h-16 lg:h-24 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-[#2bd5d5] rounded-bl-3xl" />
                  <div className="absolute -top-1 md:-top-2 -left-1 md:-left-2 w-full h-full border border-[#2bd5d5]/30 md:border-2 rounded-xl" />
                  
                  <div className="relative w-[100px] md:w-[180px] lg:w-[280px] h-[140px] md:h-[270px] lg:h-[400px] rounded-lg md:rounded-xl overflow-hidden shadow-2xl shadow-[#2bd5d5]/20 border-2 border-[#2bd5d5]/50 hover:border-[#2bd5d5] transition-all hover:scale-105 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    <LazyImage
                      src={getFeaturedCover()}
                      alt={featuredTitle}
                      className="w-full h-full object-cover"
                      fallback={<div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">No cover</div>}
                    />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-[#2bd5d5]/30">
                  {popular.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFeaturedIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === featuredIndex 
                          ? 'w-8 bg-[#2bd5d5] shadow-lg shadow-[#2bd5d5]/50' 
                          : 'w-2 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-6 sm:pb-12">
            <section className="mb-6 sm:mb-12">
              <div className="flex items-center justify-between mb-3 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2bd5d5] flex items-center gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Popular Now
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const container = document.getElementById('popular-scroll');
                      container?.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-[#0a0a0a]/80 border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-[#052424] hover:border-[#2bd5d5] transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById('popular-scroll');
                      container?.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-[#0a0a0a]/80 border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-[#052424] hover:border-[#2bd5d5] transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div id="popular-scroll" className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 sm:pb-4 hide-scrollbar scroll-smooth">
                {popular.length === 0 ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[120px] sm:w-[150px] md:w-[180px] h-[170px] sm:h-[215px] md:h-[260px] bg-gray-800 rounded-lg sm:rounded-xl animate-pulse" />
                  ))
                ) : (
                  popular.slice(0, 10).map((m, i) => (
                    <PosterCard key={m.id} manga={m} onClick={() => setSelectedManga(m.id)} delay={i * 50} />
                  ))
                )}
              </div>
            </section>

            <section className="mb-6 sm:mb-12">
              <div className="flex items-center justify-between mb-3 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2bd5d5] flex items-center gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  New Updates
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const container = document.getElementById('latest-scroll');
                      container?.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-[#0a0a0a]/80 border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-[#052424] hover:border-[#2bd5d5] transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById('latest-scroll');
                      container?.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-[#0a0a0a]/80 border border-[#2bd5d5]/30 text-[#2bd5d5] hover:bg-[#052424] hover:border-[#2bd5d5] transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div id="latest-scroll" className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 sm:pb-4 hide-scrollbar scroll-smooth">
                {latest.length === 0 ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[120px] sm:w-[150px] md:w-[180px] h-[170px] sm:h-[215px] md:h-[260px] bg-gray-800 rounded-lg sm:rounded-xl animate-pulse" />
                  ))
                ) : (
                  latest.slice(0, 10).map((m, i) => (
                    <PosterCard key={m.id} manga={m} onClick={() => setSelectedManga(m.id)} delay={i * 50} />
                  ))
                )}
              </div>
            </section>

            <section className="w-full">
              <h2 className="text-xl sm:text-2xl font-black text-[#2bd5d5] mb-2 sm:mb-4">Browse & Search</h2>
              <Browse query={query} onSelectManga={setSelectedManga} />
            </section>
          </main>
        </>
      )}
      
      <Footer onNavigatePopular={() => setLibrarySection("popular")} onNavigateLatest={() => setLibrarySection("latest")} onNavigateBrowse={() => setLibrarySection("browse")} onNavigateBookmarks={() => setShowBookmarks(true)} onNavigateAbout={() => setShowAbout(true)} />
    </div>
  );
}
