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
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [groupByChapter, setGroupByChapter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const mangaUrl = new URL(`/api/manga/${id}`, window.location.origin);
    mangaUrl.searchParams.append("includes[]", "cover_art");
    mangaUrl.searchParams.append("includes[]", "author");
    mangaUrl.searchParams.append("includes[]", "artist");

    fetch(mangaUrl.toString())
      .then(r => r.json())
      .then(d => mounted && setData(d.data))
      .catch(() => {});

    // Fetch all chapters with pagination
    const fetchAllChapters = async () => {
      let allChapters: any[] = [];
      let offset = 0;
      const limit = 500;
      let hasMore = true;

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
          
          // Check if there are more chapters to fetch
          const total = d.total || 0;
          if (allChapters.length >= total || list.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        } catch (err) {
          if (!mounted) return;
          setChapters([]);
          setError(String(err));
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

  if (!data) return <div className="text-[#93a9a9]">Loading series…</div>;

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
      <div>
        <Reader chapterId={openChapter} onClose={() => setOpenChapter(null)} chapters={displayChapters} onRequestChapterChange={(id: string) => setOpenChapter(id)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040506]">
      <Header onToggleBookmarks={() => setShowBookmarks(true)} />
      <div className="p-6">
        <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 mb-6 text-[#2bd5d5] hover:text-[#19bfbf] transition-colors font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-full md:w-[280px] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-auto max-h-[400px] object-contain" loading="lazy" />
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center text-gray-500">No cover</div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-4xl font-bold text-[#2bd5d5]">{title}</h1>
            <BookmarkButton mangaId={id} title={title} coverUrl={coverUrl} />
          </div>

          <div className="space-y-2 mb-4">
            {authors.length > 0 && (
              <div className="text-sm">
                <span className="text-[#93a9a9]">Author:</span> <span className="text-[#e6f7f7]">{authors.join(", ")}</span>
              </div>
            )}
            {artists.length > 0 && (
              <div className="text-sm">
                <span className="text-[#93a9a9]">Artist:</span> <span className="text-[#e6f7f7]">{artists.join(", ")}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-[#93a9a9]">Status:</span> <span className="text-[#2bd5d5] capitalize">{status}</span>
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {genres.map((g: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-full bg-[#174848] text-[#aeeeee] border border-[#2bd5d5]/30">{g}</span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-[#93a9a9] mb-2">Synopsis</h3>
            <p className="text-sm text-[#e6f7f7] leading-relaxed">{description || "No description available."}</p>
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
        <h3 className="text-lg font-bold text-[#2bd5d5] mb-3">All Chapters</h3>

        <div className="mb-4 p-4 rounded-lg bg-[rgba(10,10,10,0.6)] border border-[#2bd5d5]/20">
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
                <option value="desc">Recent First</option>
                <option value="asc">Oldest First</option>
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

          <div className="mt-3 text-xs text-[#93a9a9]">Showing {displayChapters.length} of {chapters.length} chapters</div>
        </div>

        <div className="max-h-[500px] overflow-auto rounded-lg bg-[rgba(10,10,10,0.4)] border border-gray-800">
          {displayChapters.length === 0 && <div className="p-4 text-[#93a9a9]">No chapters match your filters</div>}
          {displayChapters.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3 border-b border-gray-800 hover:bg-[rgba(43,213,213,0.05)] transition-colors">
              <div className="flex-1">
                <div className="font-medium text-[#e6f7f7]">{c.attributes?.title || `Chapter ${c.attributes?.chapter || "?"}`}</div>
                <div className="text-xs text-[#93a9a9] mt-1">{c.attributes?.translatedLanguage?.toUpperCase()} • {c.relationships?.find((r: any) => r.type === "scanlation_group")?.attributes?.name || "Unknown group"}</div>
              </div>
              <button onClick={() => setOpenChapter(c.id)} className="px-4 py-2 rounded bg-[#2bd5d5] text-black font-medium hover:bg-[#19bfbf] transition-colors text-sm">Read</button>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
