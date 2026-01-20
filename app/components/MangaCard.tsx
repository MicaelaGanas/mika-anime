"use client"

import React from "react";

interface Tag {
  attributes?: {
    group?: string;
    name?: Record<string, string>;
  };
}

interface Attributes {
  title?: Record<string, string>;
  status?: string;
  year?: number;
  description?: Record<string, string>;
  tags?: Tag[];
}

interface Relationship {
  type?: string;
  attributes?: { fileName?: string };
}

interface Manga {
  id: string;
  attributes?: Attributes;
  relationships?: Relationship[];
}

interface Props {
  manga: Manga;
  onOpen?: (id: string) => void;
}

const MangaCard: React.FC<Props> = ({ manga, onOpen }) => {
  const title =
    manga.attributes?.title?.en ?? Object.values(manga.attributes?.title ?? {})[0] ?? "Untitled";
  const status = manga.attributes?.status ?? "unknown";
  const year = manga.attributes?.year;
  const description = manga.attributes?.description?.en ?? "";
  const tags = manga.attributes?.tags ?? [];
  const genres = tags
    .filter((t) => t.attributes?.group === "genre")
    .slice(0, 3)
    .map((t) => t.attributes?.name?.en)
    .filter(Boolean) as string[];

  const coverRel = manga.relationships?.find((r) => r.type === "cover_art");
  const coverUrl = coverRel?.attributes?.fileName
    ? `/api/cover?mangaId=${manga.id}&fileName=${coverRel.attributes.fileName}`
    : undefined;

  const truncatedDescription = description.length > 150 ? `${description.slice(0, 150)}...` : description;

  return (
    <article
      onClick={() => onOpen?.(manga.id)}
      className="group cursor-pointer relative w-full flex gap-2 sm:gap-3 md:gap-4 items-start p-2 sm:p-3 md:p-4 rounded-lg bg-[#0a0a0a]/40 border border-[#2bd5d5]/10 hover:border-[#2bd5d5]/50 transition-all duration-300 hover:bg-[#0a0a0a]/60 backdrop-blur-sm"
    >
      <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-t-2 border-r-2 border-[#2bd5d5]/20 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12 border-b-2 border-l-2 border-[#2bd5d5]/20 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2bd5d5]/30 via-[#2bd5d5]/10 to-[#2bd5d5]/30 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative w-16 sm:w-20 h-22 sm:h-28 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-gray-800 group-hover:border-[#2bd5d5]/40 transition-all shadow-lg group-hover:shadow-[#2bd5d5]/20">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-xs text-gray-500">No cover</div>
        )}

        <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1">
          <span
            className={`px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold rounded uppercase shadow-lg ${
              status === "ongoing"
                ? "bg-green-500 text-white"
                : status === "completed"
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm sm:text-base md:text-lg text-[#e6f7f7] group-hover:text-[#2bd5d5] transition-colors mb-0.5 sm:mb-1 line-clamp-2 leading-tight">
          {title}
        </h3>

        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
          {year && (
            <span className="text-[9px] sm:text-xs font-semibold text-[#93a9a9] px-1.5 sm:px-2 py-0.5 bg-[#2bd5d5]/5 border border-[#2bd5d5]/20 rounded">
              {year}
            </span>
          )}
          {genres.slice(0, 2).map((genre, i) => (
            <span key={i} className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-[#2bd5d5]/10 text-[#2bd5d5] rounded border border-[#2bd5d5]/30">
              {genre}
            </span>
          ))}
        </div>

        {truncatedDescription && (
          <p className="text-xs sm:text-sm text-[#93a9a9] line-clamp-2 leading-relaxed">{truncatedDescription}</p>
        )}
      </div>
    </article>
  );
};

export default MangaCard;
