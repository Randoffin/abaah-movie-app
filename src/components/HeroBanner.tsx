import React from 'react';
import { Play, Bookmark, Star, Sparkles, Check, Film } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  featuredMovie: Movie;
  onSelect: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie, e: React.MouseEvent) => void;
  openAiModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredMovie,
  onSelect,
  isInWatchlist,
  onToggleWatchlist,
  openAiModal,
}) => {
  if (!featuredMovie) return null;

  const backdropImage =
    featuredMovie.Poster && featuredMovie.Poster !== 'N/A'
      ? featuredMovie.Poster
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl mb-8 group">
      {/* Background Image with Blur/Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={backdropImage}
          alt={featuredMovie.Title}
          className="w-full h-full object-cover object-top opacity-35 filter scale-105 group-hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl px-6 py-10 sm:px-10 sm:py-16 flex flex-col justify-end">
        {/* Category Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/40 uppercase tracking-widest backdrop-blur-md">
            <Film className="w-3.5 h-3.5 text-rose-400" /> Cinema Spotlight
          </span>
          {featuredMovie.imdbRating && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {featuredMovie.imdbRating} IMDb
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md mb-2">
          {featuredMovie.Title}
        </h1>

        {/* Subtitle / Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium mb-4">
          <span className="text-rose-400 font-semibold">{featuredMovie.Year}</span>
          <span>•</span>
          <span>{featuredMovie.Genre || 'Action, Sci-Fi, Drama'}</span>
          <span>•</span>
          <span className="capitalize">{featuredMovie.Type || 'Movie'}</span>
        </div>

        {/* Plot Description */}
        <p className="text-slate-300 text-sm sm:text-base line-clamp-3 max-w-2xl font-normal leading-relaxed mb-6">
          {featuredMovie.Plot ||
            "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSelect(featuredMovie)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-950/60 hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Explore Details</span>
          </button>

          <button
            onClick={(e) => onToggleWatchlist(featuredMovie, e)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all ${
              isInWatchlist
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {isInWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
            <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            onClick={openAiModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 text-amber-200 border border-amber-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ask AI Movie Companion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
