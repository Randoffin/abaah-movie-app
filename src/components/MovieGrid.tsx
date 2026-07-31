import React from 'react';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';
import { Film, Search, Loader2 } from 'lucide-react';

interface MovieGridProps {
  title: string;
  icon?: React.ReactNode;
  movies: Movie[];
  loading?: boolean;
  onSelectMovie: (movie: Movie) => void;
  watchlistMap: Set<string>;
  onToggleWatchlist: (movie: Movie, e: React.MouseEvent) => void;
  filterGenre?: string;
  setFilterGenre?: (genre: string) => void;
  availableGenres?: string[];
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  title,
  icon,
  movies,
  loading,
  onSelectMovie,
  watchlistMap,
  onToggleWatchlist,
  filterGenre,
  setFilterGenre,
  availableGenres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Crime', 'Animation', 'TV Series'],
}) => {
  return (
    <section className="mb-10">
      {/* Grid Header & Genre Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          {icon || <Film className="w-5 h-5 text-rose-500" />}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">{title}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {movies.length}
          </span>
        </div>

        {/* Genre Filters */}
        {setFilterGenre && availableGenres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setFilterGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  (filterGenre === genre) || (!filterGenre && genre === 'All')
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 animate-pulse">
              <div className="aspect-[2/3] bg-slate-800 rounded-xl mb-3" />
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-200 mb-1">No movies found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Try adjusting your search query or switching genre filter to find what you're looking for.
          </p>
        </div>
      ) : (
        /* Render Movie Cards */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              onSelect={onSelectMovie}
              isInWatchlist={watchlistMap.has(movie.imdbID)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      )}
    </section>
  );
};
