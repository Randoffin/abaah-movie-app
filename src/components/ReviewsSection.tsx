import React, { useEffect, useState } from 'react';
import { Flame, Star, ThumbsUp, MessageSquare, Search, Sparkles, Send } from 'lucide-react';
import { Review, UserProfile } from '../types';
import { subscribeReviews, addReview } from '../services/watchlist';
import { useToggleReviewLikeMutation } from '../hooks/useMovieQueries';
import { analyzeReviewSentiment } from '../services/ai';

interface ReviewsSectionProps {
  user: UserProfile | null;
  openAuthModal: () => void;
  onSelectMovie: (imdbID: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  user,
  openAuthModal,
  onSelectMovie,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterMovie, setFilterMovie] = useState('');
  
  // Post review form
  const [movieTitle, setMovieTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isPosting, setIsPosting] = useState(false);

  const toggleLikeMutation = useToggleReviewLikeMutation(null);

  useEffect(() => {
    const unsubscribe = subscribeReviews(null, (fetched) => {
      setReviews(fetched);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!movieTitle.trim() || !reviewText.trim()) return;

    setIsPosting(true);
    try {
      const aiAnalysis = await analyzeReviewSentiment(reviewText, movieTitle);

      await addReview({
        imdbID: `custom-${Date.now()}`,
        movieTitle: movieTitle.trim(),
        userId: user.uid,
        userName: user.displayName || (user.isAnonymous ? 'Guest Critic' : 'AbaahMovieApp Member'),
        userPhoto: user.photoURL || undefined,
        rating,
        reviewText: reviewText.trim(),
        sentiment: (aiAnalysis.sentiment as any) || 'positive',
        tags: aiAnalysis.tags || ['#ViewerPerspective'],
      });

      setMovieTitle('');
      setReviewText('');
      setRating(5);
    } catch (err) {
      console.error('Failed to post community review', err);
    } finally {
      setIsPosting(false);
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

  const filteredReviews = reviews.filter((r) =>
    r.movieTitle.toLowerCase().includes(filterMovie.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Community Film Reviews</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time movie critiques and discussions from film enthusiasts worldwide, enhanced with Gemini AI sentiment tags.
          </p>
        </div>

        {/* Search Reviews */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filterMovie}
            onChange={(e) => setFilterMovie(e.target.value)}
            placeholder="Filter reviews by movie..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Review Authoring Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handlePost} className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl sticky top-20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Publish a Critique</h2>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Movie / TV Title</label>
              <input
                type="text"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                placeholder="e.g. Dune: Part Two"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Rating</label>
              <div className="flex items-center gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-auto">{rating} / 5</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think of the direction, cinematography, pacing, or acting?"
                rows={4}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isPosting || !movieTitle.trim() || !reviewText.trim()}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isPosting ? 'Publishing...' : 'Publish Critique'}</span>
            </button>
          </form>
        </div>

        {/* Reviews Stream */}
        <div className="lg:col-span-2 space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No community reviews match your filter.</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to publish a movie critique above!</p>
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const isLiked = user && rev.likedBy?.includes(user.uid);
              return (
                <div
                  key={rev.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{rev.movieTitle}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-300">{rev.userName}</span>
                        <span>•</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
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

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{rev.reviewText}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rev.tags?.map((t) => (
                        <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleLike(rev)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        isLiked
                          ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rev.likesCount || 0} Upvotes</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
