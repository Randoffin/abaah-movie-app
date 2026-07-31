import React, { useState } from 'react';
import { X, Sparkles, Film, Check, Bookmark, ArrowRight, Loader2 } from 'lucide-react';
import { AIRecommendation, Movie } from '../types';
import { getAiRecommendations } from '../services/ai';

interface AiAssistantModalProps {
  onClose: () => void;
  onSelectMovieTitle: (title: string) => void;
  watchlistMap: Set<string>;
  onToggleWatchlistByMovie: (movie: Movie) => void;
}

const MOODS = [
  'Mind-Bending Sci-Fi',
  'Adrenaline Surge',
  'Cozy & Heartwarming',
  'Dark Crime Thriller',
  'Thought-Provoking Drama',
  'Fun Weekend Binge',
];

const GENRES = [
  'Sci-Fi',
  'Action',
  'Drama',
  'Crime',
  'Animation',
  'Comedy',
  'Horror',
  'Mystery',
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  onClose,
  onSelectMovieTitle,
  watchlistMap,
  onToggleWatchlistByMovie,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('Mind-Bending Sci-Fi');
  const [selectedGenre, setSelectedGenre] = useState<string>('Sci-Fi');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [notice, setNotice] = useState<string | undefined>();

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const res = await getAiRecommendations({
      mood: selectedMood,
      genre: selectedGenre,
      query: customPrompt.trim(),
    });

    setRecommendations(res.recommendations);
    setNotice(res.notice);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-950/50">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">AbaahMovieApp AI Companion</h2>
              <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash model</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Controls Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Mood selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Select Desired Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    type="button"
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedMood === mood
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                2. Genre Preference
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedGenre === g
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                3. Custom Request (Optional)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'A Christopher Nolan style movie with a mind-bending plot twist and great Hans Zimmer score'"
                className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consulting Gemini AI Critic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Recommendations</span>
                </>
              )}
            </button>
          </form>

          {notice && (
            <p className="text-[11px] text-amber-400/90 italic bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-center">
              {notice}
            </p>
          )}

          {/* Results List */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                AI Curated Matches
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {recommendations.map((rec, i) => {
                  const tempMovieObj: Movie = {
                    Title: rec.title,
                    Year: rec.year,
                    imdbID: rec.imdbID || `ai-rec-${i}-${rec.title.replace(/\s+/g, '-').toLowerCase()}`,
                    Type: 'movie',
                    Poster: rec.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
                    Genre: rec.genre,
                  };

                  const isInWatchlist = watchlistMap.has(tempMovieObj.imdbID);

                  return (
                    <div
                      key={i}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            onClick={() => {
                              onSelectMovieTitle(rec.title);
                              onClose();
                            }}
                            className="text-base font-bold text-slate-100 hover:text-rose-400 cursor-pointer"
                          >
                            {rec.title} ({rec.year})
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {rec.matchPercentage}% Match
                          </span>
                          <span className="text-xs text-slate-400 font-medium">• {rec.genre}</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal">{rec.synopsis}</p>
                        
                        <p className="text-xs text-rose-300/90 italic bg-rose-500/10 p-2 rounded-lg border border-rose-500/15">
                          💡 <strong>Why you'll love it:</strong> {rec.reason}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0">
                        <button
                          onClick={() => onToggleWatchlistByMovie(tempMovieObj)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isInWatchlist
                              ? 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                              : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                          }`}
                        >
                          {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isInWatchlist ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectMovieTitle(rec.title);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 py-1"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
