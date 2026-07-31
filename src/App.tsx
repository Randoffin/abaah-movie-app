/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Movie, MovieDetail, UserProfile, WatchlistItem, WatchlistStatus } from './types';
import { searchMovies, getMovieDetail } from './services/omdb';
import { subscribeWatchlist } from './services/watchlist';
import { useToggleWatchlistMutation } from './hooks/useMovieQueries';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetailModal } from './components/MovieDetailModal';
import { WatchlistSection } from './components/WatchlistSection';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ReviewsSection } from './components/ReviewsSection';
import { AuthModal } from './components/AuthModal';

import { Compass, Flame, Sparkles, Tv, Clapperboard } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'watchlist' | 'reviews'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');

  // Firebase Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Firestore Watchlist State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const watchlistSet = new Set(watchlist.map((item) => item.imdbID));

  // Movies State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Featured Hero Movie
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Selected Movie for Detail Modal
  const [selectedImdbID, setSelectedImdbID] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore Watchlist when user logged in
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    const unsubscribe = subscribeWatchlist(user.uid, (items) => {
      setWatchlist(items);
    });
    return () => unsubscribe();
  }, [user]);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      searchMovies(''),
      searchMovies('', 'series')
    ]).then(([fetchedMovies, fetchedSeries]) => {
      if (isMounted) {
        setMovies(fetchedMovies);
        setSeriesList(fetchedSeries);
        if (fetchedMovies.length > 0) {
          setFeaturedMovie(fetchedMovies[0]);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Search Input Submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);

    const typeParam = filterGenre === 'TV Series' ? 'series' : undefined;
    const yearParam = filterGenre.match(/\d{4}/) ? filterGenre : undefined;

    const results = await searchMovies(searchQuery.trim(), typeParam, yearParam);
    setMovies(results);
    setLoading(false);
  };

  // Genre filtering logic
  const filteredMovies = movies.filter((movie) => {
    if (filterGenre === 'All') return true;
    if (filterGenre === 'TV Series') return movie.Type === 'series';
    if (!movie.Genre) return true;
    return movie.Genre.toLowerCase().includes(filterGenre.toLowerCase());
  });

  const toggleWatchlistMutation = useToggleWatchlistMutation();

  // Toggle Watchlist handler (Optimistic updates via TanStack Query)
  const handleToggleWatchlist = async (movie: Movie | MovieDetail, status: WatchlistStatus = 'want_to_watch') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const existing = watchlist.find((w) => w.imdbID === movie.imdbID);
    toggleWatchlistMutation.mutate({
      userId: user.uid,
      movie,
      status,
      existingItem: existing,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const openMovieTitleDetail = async (title: string) => {
    const detail = await getMovieDetail('', title);
    if (detail) {
      setSelectedImdbID(detail.imdbID);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        watchlistCount={watchlist.length}
        openAiModal={() => setIsAiModalOpen(true)}
        user={user}
        openAuthModal={() => setIsAuthModalOpen(true)}
        handleLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'explore' && (
          <div>
            {/* Featured Blockbuster Banner */}
            {featuredMovie && (
              <HeroBanner
                featuredMovie={featuredMovie}
                onSelect={(m) => setSelectedImdbID(m.imdbID)}
                isInWatchlist={watchlistSet.has(featuredMovie.imdbID)}
                onToggleWatchlist={handleToggleWatchlist}
                openAiModal={() => setIsAiModalOpen(true)}
              />
            )}

            {/* Trending Movies Grid */}
            <MovieGrid
              title="Trending & Popular Cinema"
              icon={<Clapperboard className="w-5 h-5 text-rose-500" />}
              movies={filteredMovies}
              loading={loading}
              onSelectMovie={(m) => setSelectedImdbID(m.imdbID)}
              watchlistMap={watchlistSet}
              onToggleWatchlist={handleToggleWatchlist}
              filterGenre={filterGenre}
              setFilterGenre={setFilterGenre}
            />

            {/* TV Series Grid Showcase */}
            {seriesList.length > 0 && filterGenre === 'All' && (
              <MovieGrid
                title="Binge-Worthy TV Series"
                icon={<Tv className="w-5 h-5 text-cyan-400" />}
                movies={seriesList}
                loading={false}
                onSelectMovie={(m) => setSelectedImdbID(m.imdbID)}
                watchlistMap={watchlistSet}
                onToggleWatchlist={handleToggleWatchlist}
                availableGenres={[]}
              />
            )}
          </div>
        )}

        {/* Watchlist Section */}
        {activeTab === 'watchlist' && (
          <WatchlistSection
            items={watchlist}
            onSelectMovie={(imdbID) => setSelectedImdbID(imdbID)}
            openAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {/* Community Reviews Section */}
        {activeTab === 'reviews' && (
          <ReviewsSection
            user={user}
            openAuthModal={() => setIsAuthModalOpen(true)}
            onSelectMovie={(imdbID) => setSelectedImdbID(imdbID)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">AbaahMovieApp</span>
            <span>•</span>
            <span>OMDb API + Firebase Firestore + Gemini 2.5 AI</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/prompt.md" target="_blank" className="hover:text-rose-400 transition-colors">prompt.md</a>
            <a href="/improvement.md" target="_blank" className="hover:text-rose-400 transition-colors">improvement.md</a>
            <a href="/ai-assistance.md" target="_blank" className="hover:text-rose-400 transition-colors">ai-assistance.md</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedImdbID && (
        <MovieDetailModal
          imdbID={selectedImdbID}
          onClose={() => setSelectedImdbID(null)}
          isInWatchlist={watchlistSet.has(selectedImdbID)}
          onToggleWatchlist={handleToggleWatchlist}
          user={user}
          openAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {isAiModalOpen && (
        <AiAssistantModal
          onClose={() => setIsAiModalOpen(false)}
          onSelectMovieTitle={openMovieTitleDetail}
          watchlistMap={watchlistSet}
          onToggleWatchlistByMovie={(m) => handleToggleWatchlist(m)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

    </div>
  );
}
