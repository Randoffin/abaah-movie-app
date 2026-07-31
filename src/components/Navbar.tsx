import React, { useState } from 'react';
import { Film, Search, Bookmark, Sparkles, User, LogOut, Flame, Compass } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'explore' | 'watchlist' | 'reviews';
  setActiveTab: (tab: 'explore' | 'watchlist' | 'reviews') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  watchlistCount: number;
  openAiModal: () => void;
  user: UserProfile | null;
  openAuthModal: () => void;
  handleLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  watchlistCount,
  openAiModal,
  user,
  openAuthModal,
  handleLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('explore')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AbaahMovieApp
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              AI & Firebase
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows, actors, directors..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/90 border border-slate-800 rounded-full text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
        </form>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'explore'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === 'watchlist'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="ml-1 text-xs font-bold px-1.5 py-0.2 bg-rose-500/30 text-rose-200 rounded-full border border-rose-400/30">
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Reviews</span>
          </button>

          {/* AI Companion Button */}
          <button
            onClick={openAiModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-purple-950/40 hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-200" />
            <span className="hidden xs:inline">AI Assistant</span>
          </button>

          {/* User Profile / Login */}
          <div className="relative ml-1">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-700/80 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-rose-400 font-bold flex items-center justify-center text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {user.displayName || (user.isAnonymous ? 'Guest User' : 'AbaahMovieApp Member')}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email || 'Anonymous session'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Search Input */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-900 border border-slate-800 rounded-full text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500/80"
          />
        </form>
      </div>
    </header>
  );
};
