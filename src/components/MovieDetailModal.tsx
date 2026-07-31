import React, { useEffect, useState } from 'react';
import { X, Star, Bookmark, Check, Award, Clock, Film, MessageSquare, Send, Sparkles, DollarSign, Globe, ThumbsUp } from 'lucide-react';
import { MovieDetail, Review, UserProfile, WatchlistStatus } from '../types';
import { useMovieDetail, useToggleReviewLikeMutation } from '../hooks/useMovieQueries';
import { addReview, subscribeReviews } from '../services/watchlist';
import { analyzeReviewSentiment } from '../services/ai';

interface MovieDetailModalProps {
  imdbID: string;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movieDetail: MovieDetail, status?: WatchlistStatus) => void;
  user: UserProfile | null;
  openAuthModal: () => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  imdbID,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  user,
  openAuthModal,
}) => {
  const { data: movie, isLoading: loading } = useMovieDetail(imdbID);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const toggleLikeMutation = useToggleReviewLikeMutation(imdbID);

  useEffect(() => {
    const unsubscribe = subscribeReviews(imdbID, (fetched) => {
      setReviews(fetched);
    });
    return () => unsubscribe();
  }, [imdbID]);

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newReviewText.trim() || !movie) return;

    setIsSubmittingReview(true);
    try {
      // Optional AI sentiment tag evaluation
      const aiAnalysis = await analyzeReviewSentiment(newReviewText, movie.Title);

      await addReview({
        imdbID: movie.imdbID,
        movieTitle: movie.Title,
        userId: user.uid,
        userName: user.displayName || (user.isAnonymous ? 'Guest Cinephile' : 'Community Member'),
        userPhoto: user.photoURL || undefined,
        rating: newRating,
        reviewText: newReviewText.trim(),
        sentiment: (aiAnalysis.sentiment as any) || 'positive',
        tags: aiAnalysis.tags || ['#Recommended'],
      });

      setNewReviewText('');
      setNewRating(5);
    } catch (err) {
      console.error('Failed to post review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleLike = (review: Review) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const isLiked = review.likedBy?.includes(user.uid) || false;
    toggleLikeMutation.mutate({ reviewId: review.id, userId: user.uid, isLiked });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-950/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700/80 transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Retrieving movie details...</p>
          </div>
        ) : !movie ? (
          <div className="p-12 text-center">
            <p className="text-slate-300 font-semibold">Failed to load details for this title.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Modal Header Backdrop Banner */}
            <div className="relative w-full h-64 sm:h-80 bg-slate-950 overflow-hidden">
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'}
                alt={movie.Title}
                className="w-full h-full object-cover object-center filter blur-md scale-110 opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

              {/* Main Info Hero inside modal */}
              <div className="absolute inset-0 p-6 sm:p-8 flex items-end gap-6">
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
                  alt={movie.Title}
                  className="w-28 sm:w-40 aspect-[2/3] object-cover rounded-2xl shadow-2xl border-2 border-slate-700/80 hidden sm:block flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white uppercase tracking-wider">
                      {movie.Type || 'Movie'}
                    </span>
                    {movie.Rated && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {movie.Rated}
                      </span>
                    )}
                    {movie.Runtime && (
                      <span className="flex items-center gap-1 text-xs text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-rose-400" /> {movie.Runtime}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                    {movie.Title} <span className="text-slate-400 font-normal text-xl sm:text-2xl">({movie.Year})</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-1 mb-3">
                    {movie.Genre}
                  </p>

                  {/* Rating Badges */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {movie.imdbRating && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{movie.imdbRating} / 10 IMDb</span>
                      </div>
                    )}
                    {movie.Metascore && movie.Metascore !== 'N/A' && (
                      <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        {movie.Metascore} Metascore
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900 sticky top-0 z-20">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'info'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview & Cast
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Community Reviews ({reviews.length})</span>
                </button>
              </div>

              {/* Watchlist Toggle */}
              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isInWatchlist
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/50 hover:bg-rose-600/30'
                    : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500 shadow-md shadow-rose-950/50'
                }`}
              >
                {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {activeTab === 'info' ? (
                <div className="space-y-6">
                  
                  {/* Plot */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Plot Summary</h3>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{movie.Plot}</p>
                  </div>

                  {/* Cast & Crew Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                    <div>
                      <p className="text-xs font-bold text-rose-400 uppercase">Director</p>
                      <p className="text-sm text-slate-200 font-medium">{movie.Director || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-400 uppercase">Writers</p>
                      <p className="text-sm text-slate-200 font-medium">{movie.Writer || 'N/A'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-rose-400 uppercase">Key Cast</p>
                      <p className="text-sm text-slate-200 font-medium">{movie.Actors || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {movie.Awards && movie.Awards !== 'N/A' && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-300">Awards & Nominations</p>
                          <p className="text-xs text-slate-400 mt-0.5">{movie.Awards}</p>
                        </div>
                      </div>
                    )}

                    {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <DollarSign className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-300">Box Office Gross</p>
                          <p className="text-xs text-slate-400 mt-0.5">{movie.BoxOffice}</p>
                        </div>
                      </div>
                    )}

                    {movie.Language && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-300">Language & Origin</p>
                          <p className="text-xs text-slate-400 mt-0.5">{movie.Language}</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Reviews Tab */
                <div className="space-y-6">
                  
                  {/* Write a Review Box */}
                  <form onSubmit={handlePostReview} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
                    <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Write a Review for {movie.Title}
                    </h3>

                    {/* Star Rating selector */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-slate-400">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your thought on the cinematography, plot, or performances..."
                      rows={3}
                      className="w-full p-3 text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-slate-500">
                        {user ? 'Reviews are published to Firestore community' : 'Sign in required to post'}
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmittingReview || !newReviewText.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingReview ? 'Analyzing...' : 'Publish Review'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Reviews Feed */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No community reviews yet for this title. Be the first to share your review!
                      </div>
                    ) : (
                      reviews.map((rev) => {
                        const isLiked = user && rev.likedBy?.includes(user.uid);
                        return (
                          <div key={rev.id} className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center">
                                  {rev.userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-200">{rev.userName}</span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">{rev.reviewText}</p>

                            {/* Tags & Likes */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {rev.tags?.map((t) => (
                                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                    {t}
                                  </span>
                                ))}
                              </div>

                              <button
                                onClick={() => handleLike(rev)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  isLiked
                                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{rev.likesCount || 0}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
