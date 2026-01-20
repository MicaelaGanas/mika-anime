"use client"

import React, { useEffect, useState, useCallback } from "react";
import MangaCard from "./MangaCard";

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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let mounted = true;
    const q = query?.trim();
    setLoading(true);
    setOffset(0);

    fetch(buildUrl({ limit: LIMIT, offset: 0, q, status, sortBy, genreMode, selectedGenre, hideFilters }))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setManga(data.data || []);
        setHasMore(data.total > LIMIT);
      })
      .catch((error) => {
        console.error('Failed to fetch manga:', error);
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

    fetch(buildUrl({ limit: LIMIT, offset: newOffset, q, status, sortBy, genreMode, selectedGenre, hideFilters }))
      .then((r) => r.json())
      .then((data) => {
        setManga((prev) => [...prev, ...(data.data || [])]);
        setOffset(newOffset);
        setHasMore(newOffset + LIMIT < data.total);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [offset, query, status, sortBy, genreMode, selectedGenre, hideFilters]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {!hideFilters && (
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6">
            <div className="p-3 lg:p-4 rounded-lg bg-[#0a0a0a]/60 border border-[#2bd5d5]/20">
              <h3 className="text-base lg:text-lg font-bold text-[#2bd5d5] mb-3 lg:mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </h3>

              <div className="mb-4">
                <label className="block text-xs text-[#93a9a9] mb-2 font-semibold">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#040506] border border-[#2bd5d5]/30 text-[#e6f7f7] text-sm focus:outline-none focus:border-[#2bd5d5] transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#93a9a9] mb-2 font-semibold">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#040506] border border-[#2bd5d5]/30 text-[#e6f7f7] text-sm focus:outline-none focus:border-[#2bd5d5] transition-colors"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popular">Most Popular</option>
                  <option value="latest">Latest Upload</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 mt-3 lg:mt-4">
                <button
                  onClick={() => {
                    setStatus("all");
                    setSortBy("relevance");
                  }}
                  className="flex-1 lg:w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 text-[#2bd5d5] text-xs lg:text-sm font-semibold hover:bg-[#2bd5d5]/20 transition-colors"
                >
                  Reset
                </button>
                <div className="flex-1 lg:hidden px-2 py-1.5 rounded bg-[#2bd5d5]/5 border border-[#2bd5d5]/20 text-center">
                  <p className="text-xs text-[#93a9a9]">
                    <span className="font-bold text-[#2bd5d5]">{manga.length}</span> found
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block p-4 rounded-lg bg-[#2bd5d5]/5 border border-[#2bd5d5]/20">
              <p className="text-sm text-[#93a9a9]">
                <span className="font-bold text-[#2bd5d5]">{manga.length}</span> manga found
              </p>
            </div>
          </div>
        </aside>
      )}

      <section className="flex-1">
        {loading && <div className="text-[#93a9a9] text-sm">Loading…</div>}
        {!loading && manga.length === 0 && <div className="text-[#93a9a9] text-sm">No results</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 w-full">
          {manga.map((m) => (
            <MangaCard key={m.id} manga={m} onOpen={onSelectManga || (() => {})} />
          ))}
        </div>

        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 rounded-lg bg-[#2bd5d5]/10 border-2 border-[#2bd5d5]/30 text-[#2bd5d5] font-bold hover:bg-[#2bd5d5]/20 hover:border-[#2bd5d5]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
