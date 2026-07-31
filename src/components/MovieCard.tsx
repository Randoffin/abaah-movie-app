import React from 'react';
import { Star, Bookmark, Check, Info, Film, Tv } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie, e: React.MouseEvent) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const posterUrl =
    movie.Poster && movie.Poster !== 'N/A'
      ? movie.Poster
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onSelect(movie)}
      className="group relative bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-950/30 hover:border-slate-700/80 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.Title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-200 border border-slate-700/50 backdrop-blur-md">
            {movie.Type === 'series' ? <Tv className="w-3 h-3 text-cyan-400" /> : <Film className="w-3 h-3 text-rose-400" />}
            {movie.Type || 'Movie'}
          </span>

          <button
            onClick={(e) => onToggleWatchlist(movie, e)}
            title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isInWatchlist
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50'
                : 'bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white border-slate-700/60'
            }`}
          >
            {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* IMDb Rating Badge */}
        {movie.imdbRating && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-xs font-bold shadow-md z-10">
            <Star className="w-3 h-3 fill-slate-950" />
            <span>{movie.imdbRating}</span>
          </div>
        )}

        {/* Hover Quick Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 text-white font-medium text-xs shadow-xl scale-90 group-hover:scale-100 transition-transform">
            <Info className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-slate-900/90">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm line-clamp-1 group-hover:text-rose-400 transition-colors">
            {movie.Title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>{movie.Year}</span>
            {movie.Genre && <span className="truncate text-slate-400/80">• {movie.Genre.split(',')[0]}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};
