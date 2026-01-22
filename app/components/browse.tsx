"use client"

import React, { useEffect, useState, useCallback } from "react";
import MangaCard from "./MangaCard";
import EmptyState from "./EmptyState";
import { fetchJsonCached } from "../lib/fetchCache";

type MangaItem = any;

interface Props {
  query?: string;
  onSelectManga?: (id: string) => void;
  genreMode?: boolean;
  selectedGenre?: string;
  hideFilters?: boolean;
}

const LIMIT = 12;

const GENRE_TAG_IDS: Record<string, string> = {
  Action: "391b0423-d847-456f-aff0-8b0cfc03066b",
  Adventure: "87cc87cd-a395-47af-b27a-93258283bbc6",
  Comedy: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
  Drama: "b9af3a63-f058-46de-a9a0-e0c13906197a",
  Fantasy: "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
  Horror: "cdad7e68-1419-41dd-bdcf-5a64d0f6b3e4",
  Mystery: "ee968100-4191-4968-93d3-f82d72be7e46",
  Romance: "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
  "Sci-Fi": "256c8bd9-4904-4360-bf4f-508a76d67183",
  "Slice of Life": "e5301a23-ebd9-49dd-a0cb-2add944c7fe9",
  Sports: "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
  Supernatural: "eabc5b4c-6aff-42f3-b657-3e90cbd00b75",
  Thriller: "07251805-a27e-4d59-b488-f0bfbec15168",
  Tragedy: "f8f62932-27da-4fe4-8ee1-6779a8c5edba",
  Isekai: "ace04997-f6bd-436e-b261-779182193d3d",
  "Martial Arts": "799c202e-7daa-44eb-9cf7-8a3c0441531e",
  "School Life": "caaa44eb-cd40-4177-b930-79d3ef2afe87",
  Historical: "33771934-028e-4cb3-8744-691e866a923e",
};

function buildUrl({ limit = LIMIT, offset = 0, q, status, sortBy, genreMode, selectedGenre, hideFilters }: {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
  sortBy?: string;
  genreMode?: boolean;
  selectedGenre?: string;
  hideFilters?: boolean;
}) {
  const url = new URL("/api/manga", typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("includes[]", "cover_art");
  url.searchParams.set("contentRating[]", "safe");
  url.searchParams.set("contentRating[]", "suggestive");

  if (genreMode && selectedGenre && GENRE_TAG_IDS[selectedGenre]) {
    url.searchParams.set("includedTags[]", GENRE_TAG_IDS[selectedGenre]);
    url.searchParams.set("includedTagsMode", "AND");
  } else if (q) {
    url.searchParams.set("title", q);
  }

  if (status && status !== "all" && !hideFilters) url.searchParams.set("status[]", status);

  if (sortBy === "popular") url.searchParams.set("order[followedCount]", "desc");
  else if (sortBy === "latest") url.searchParams.set("order[createdAt]", "desc");
  else if (sortBy === "title") url.searchParams.set("order[title]", "asc");

  return url.toString();
}

export default function Browse({ query = "", onSelectManga, genreMode, selectedGenre, hideFilters }: Props) {
  const [manga, setManga] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [trendingPeriod, setTrendingPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [trendingManga, setTrendingManga] = useState<MangaItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let mounted = true;
    const q = query?.trim();
    setLoading(true);
    setOffset(0);

    fetchJsonCached(buildUrl({ limit: LIMIT, offset: 0, q, status, sortBy, genreMode, selectedGenre, hideFilters }))
      .then((data) => {
        if (!mounted) return;
        const list = data.data || [];
        // If query provided and no results, try a broader fallback (increase limit, remove contentRating filters)
        if (q && list.length === 0) {
          try {
            const fallbackUrl = new URL("/api/manga", typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
            fallbackUrl.searchParams.set("limit", String(50));
            fallbackUrl.searchParams.set("offset", String(0));
            fallbackUrl.searchParams.set("includes[]", "cover_art");
            fallbackUrl.searchParams.set("title", q);
            // broad search without contentRating filters
            fetchJsonCached(fallbackUrl.toString()).then((fb) => {
              if (!mounted) return;
              setManga(fb.data || []);
              setHasMore((fb.total || 0) > 50);
            }).catch(() => setManga([]));
          } catch (e) {
            setManga([]);
          }
        } else {
          setManga(list);
          setHasMore(data.total > LIMIT);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch manga:", error);
        setManga([]);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [query, status, sortBy, genreMode, selectedGenre, hideFilters]);

  const loadMore = useCallback(() => {
    const q = query?.trim();
    const newOffset = offset + LIMIT;
    setLoadingMore(true);

    fetchJsonCached(buildUrl({ limit: LIMIT, offset: newOffset, q, status, sortBy, genreMode, selectedGenre, hideFilters }))
      .then((data) => {
        setManga((prev) => [...prev, ...(data.data || [])]);
        setOffset(newOffset);
        setHasMore(newOffset + LIMIT < data.total);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [offset, query, status, sortBy, genreMode, selectedGenre, hideFilters]);

  // Fetch trending manga
  useEffect(() => {
    let mounted = true;
    setTrendingLoading(true);

    const trendingUrl = new URL("/api/manga", typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    trendingUrl.searchParams.set("limit", "10");
    trendingUrl.searchParams.set("offset", "0");
    trendingUrl.searchParams.set("includes[]", "cover_art");
    trendingUrl.searchParams.set("contentRating[]", "safe");
    trendingUrl.searchParams.set("contentRating[]", "suggestive");
    
    // Set order based on trending period
    if (trendingPeriod === 'weekly' || trendingPeriod === 'monthly') {
      trendingUrl.searchParams.set("order[followedCount]", "desc");
    } else {
      trendingUrl.searchParams.set("order[rating]", "desc");
    }

    fetchJsonCached(trendingUrl.toString())
      .then((data) => {
        if (!mounted) return;
        setTrendingManga(data.data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch trending manga:", error);
        if (mounted) setTrendingManga([]);
      })
      .finally(() => {
        if (mounted) setTrendingLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [trendingPeriod]);

  return (
    <div className="space-y-6">
      {/* Top Filters Bar */}
      {!hideFilters && (
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
              <div className="flex-1 sm:flex-initial sm:w-48">
                <label className="block text-xs text-gray-400 mb-2 font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#040506] border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2bd5d5] focus:border-transparent transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex-1 sm:flex-initial sm:w-48">
                <label className="block text-xs text-gray-400 mb-2 font-medium">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#040506] border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2bd5d5] focus:border-transparent transition-all"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popular">Most Popular</option>
                  <option value="latest">Latest Upload</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setStatus("all");
                  setSortBy("relevance");
                }}
                className="px-4 py-2 rounded bg-[#040506] border border-gray-800 text-gray-400 text-sm font-medium hover:bg-[#0a0a0a] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2bd5d5]"
                aria-label="Reset filters"
              >
                Reset
              </button>
              <div className="px-4 py-2 rounded bg-[#040506] border border-gray-800">
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-[#2bd5d5]">{manga.length}</span> found
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Trending Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <section className="flex-1 min-w-0">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] rounded-lg border border-gray-800 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="flex-shrink-0 w-24 h-32 bg-gray-800 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-800 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
                      <div className="flex gap-1 mt-2">
                        <div className="h-5 w-12 bg-gray-800 rounded-full animate-pulse" />
                        <div className="h-5 w-16 bg-gray-800 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && manga.length === 0 && (
            <EmptyState
              title="No results"
              description="We couldn't find any manga matching your search or filters. Try clearing filters or search terms."
              actionLabel="Reset filters"
              onAction={() => {
                setStatus("all");
                setSortBy("relevance");
                setOffset(0);
              }}
            />
          )}
          
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {manga.map((m) => (
                <MangaCard key={m.id} manga={m} onOpen={onSelectManga || (() => {})} />
              ))}
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-lg bg-[#2bd5d5]/10 border-2 border-[#2bd5d5]/30 text-[#2bd5d5] font-bold hover:bg-[#2bd5d5]/20 hover:border-[#2bd5d5]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2bd5d5]"
                aria-label="Load more manga"
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
        </section>

        {/* Trending Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2bd5d5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Trending
              </h3>
            </div>

            {/* Period Tabs */}
            <div className="flex border-b border-gray-800">
              {(['weekly', 'monthly', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendingPeriod(period)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                    trendingPeriod === period
                      ? 'bg-[#040506] text-[#2bd5d5] border-b-2 border-[#2bd5d5]'
                      : 'text-gray-400 hover:text-white hover:bg-[#0a0a0a]/50'
                  }`}
                  aria-label={`Show ${period} trending`}
                  aria-pressed={trendingPeriod === period}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Trending Content */}
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {trendingLoading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded bg-[#040506] border border-gray-800">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-gray-800 animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : trendingManga.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No trending manga available
                </div>
              ) : (
                trendingManga.map((m, i) => {
                  const title = m.attributes?.title?.en || m.attributes?.title?.['ja-ro'] || m.attributes?.title?.[Object.keys(m.attributes?.title || {})[0]] || 'Unknown Title';
                  const description = m.attributes?.description?.en || m.attributes?.description?.[Object.keys(m.attributes?.description || {})[0]] || '';
                  const year = m.attributes?.year || 'N/A';
                  const status = m.attributes?.status || '';
                  
                  const coverRel = m.relationships?.find((r: any) => r.type === 'cover_art');
                  const coverFilename = coverRel?.attributes?.fileName;
                  const coverUrl = coverFilename ? `https://uploads.mangadex.org/covers/${m.id}/${coverFilename}.256.jpg` : '/placeholder.jpg';
                  
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => onSelectManga?.(m.id)}
                      className="flex gap-3 p-3 rounded bg-[#040506] border border-gray-800 hover:border-[#2bd5d5]/30 hover:bg-[#0a0a0a] transition-all cursor-pointer group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectManga?.(m.id);
                        }
                      }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-[#2bd5d5]/10 text-[#2bd5d5] font-bold text-xs group-hover:bg-[#2bd5d5]/20 transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden border border-gray-800 bg-gray-900">
                        <img 
                          src={coverUrl} 
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate group-hover:text-[#2bd5d5] transition-colors">
                          {title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {year}{status ? ` • ${status.charAt(0).toUpperCase() + status.slice(1)}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
