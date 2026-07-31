import React, { useState } from 'react';
import { Bookmark, Star, Trash2, Edit3, Check, Eye, Play, Film, Sparkles } from 'lucide-react';
import { WatchlistItem, WatchlistStatus } from '../types';
import { updateWatchlistItem, removeFromWatchlist } from '../services/watchlist';

interface WatchlistSectionProps {
  items: WatchlistItem[];
  onSelectMovie: (imdbID: string) => void;
  openAiModal: () => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  items,
  onSelectMovie,
  openAiModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | WatchlistStatus>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const totalSaved = items.length;
  const watchedCount = items.filter((i) => i.status === 'watched').length;
  const watchingCount = items.filter((i) => i.status === 'watching').length;

  const startEditing = (item: WatchlistItem) => {
    setEditingItemId(item.id);
    setTempRating(item.userRating || 0);
    setTempNotes(item.notes || '');
  };

  const saveEdits = async (itemId: string) => {
    await updateWatchlistItem(itemId, {
      userRating: tempRating,
      notes: tempNotes.trim(),
    });
    setEditingItemId(null);
  };

  const handleStatusChange = async (itemId: string, status: WatchlistStatus) => {
    await updateWatchlistItem(itemId, { status });
  };

  const handleDelete = async (itemId: string) => {
    await removeFromWatchlist(itemId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Watchlist Header & Summary Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Your Cinema Watchlist</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            Synced with Firebase Cloud Firestore. Organize your movies, track watch status, rate films, and add custom logs.
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block uppercase font-semibold">Saved</span>
            <span className="text-lg font-bold text-slate-100">{totalSaved}</span>
          </div>
          <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block uppercase font-semibold">Watching</span>
            <span className="text-lg font-bold text-amber-400">{watchingCount}</span>
          </div>
          <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block uppercase font-semibold">Completed</span>
            <span className="text-lg font-bold text-emerald-400">{watchedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & AI Assistant CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start">
          {[
            { id: 'all', label: 'All Saved' },
            { id: 'want_to_watch', label: 'Want to Watch' },
            { id: 'watching', label: 'Watching' },
            { id: 'watched', label: 'Watched' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {items.length > 0 && (
          <button
            onClick={openAiModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 text-amber-200 border border-amber-500/30 self-start sm:self-auto transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Watchlist Curator</span>
          </button>
        )}
      </div>

      {/* List / Grid Display */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
          <Film className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No movies in this list</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Explore popular movies or ask our AI assistant to find film suggestions to add to your list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="flex gap-4">
                {/* Poster */}
                <img
                  src={item.poster}
                  alt={item.title}
                  onClick={() => onSelectMovie(item.imdbID)}
                  className="w-20 aspect-[2/3] object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform flex-shrink-0 bg-slate-950"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      onClick={() => onSelectMovie(item.imdbID)}
                      className="text-base font-bold text-slate-100 hover:text-rose-400 cursor-pointer truncate"
                    >
                      {item.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Remove from watchlist"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.year} {item.genre ? `• ${item.genre.split(',')[0]}` : ''}
                  </p>

                  {/* Status Dropdown / Chips */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as WatchlistStatus)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="want_to_watch">Want to Watch</option>
                      <option value="watching">Watching</option>
                      <option value="watched">Watched</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Editing Notes & User Rating */}
              {editingItemId === item.id ? (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Your Personal Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setTempRating(s * 2)}>
                          <Star
                            className={`w-4 h-4 ${
                              s * 2 <= tempRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-amber-400 font-bold ml-1">{tempRating}/10</span>
                    </div>
                  </div>

                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add personal note..."
                    rows={2}
                    className="w-full p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingItemId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdits(item.id)}
                      className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-500"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                /* Static Note / Rating display */
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.userRating ? `${item.userRating}/10` : 'Not rated'}</span>
                    {item.notes && <span className="text-slate-400 italic truncate max-w-[120px]"> - "{item.notes}"</span>}
                  </div>

                  <button
                    onClick={() => startEditing(item)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-400 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Log / Rate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
