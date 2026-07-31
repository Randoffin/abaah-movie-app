import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchMovies, getMovieDetail } from '../services/omdb';
import { getLocalCache, setLocalCache } from '../services/queryClient';
import { Movie, MovieDetail, WatchlistItem, WatchlistStatus, Review } from '../types';
import { addToWatchlist, removeFromWatchlist, toggleLikeReview } from '../services/watchlist';

// Movie Search Query Hook with LocalStorage offline fallback
export function useMovieSearch(query: string, type?: string, year?: string) {
  const cacheKey = `search_${query}_${type || 'all'}_${year || 'all'}`;

  return useQuery({
    queryKey: ['movies', 'search', query, type, year],
    queryFn: async () => {
      // Fetch fresh results from OMDb proxy
      const results = await searchMovies(query, type, year);
      if (results && results.length > 0) {
        setLocalCache(cacheKey, results);
        return results;
      }
      // If offline or no results returned due to network error, try local storage fallback
      const cached = getLocalCache<Movie[]>(cacheKey);
      return cached || [];
    },
    initialData: () => getLocalCache<Movie[]>(cacheKey) || undefined,
    staleTime: 1000 * 60 * 15, // 15 mins
  });
}

// Movie Detail Query Hook with instant cache & offline fallback
export function useMovieDetail(imdbID: string | null, title?: string) {
  const cacheKey = `detail_${imdbID || title}`;

  return useQuery({
    queryKey: ['movie', 'detail', imdbID || title],
    queryFn: async () => {
      if (!imdbID && !title) return null;
      const detail = await getMovieDetail(imdbID || '', title);
      if (detail) {
        setLocalCache(cacheKey, detail);
        return detail;
      }
      const cached = getLocalCache<MovieDetail>(cacheKey);
      return cached || null;
    },
    enabled: Boolean(imdbID || title),
    initialData: () => (imdbID || title ? getLocalCache<MovieDetail>(cacheKey) || undefined : undefined),
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

// Watchlist Mutation Hook with Optimistic Updates
export function useToggleWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      movie,
      status = 'want_to_watch',
      existingItem,
    }: {
      userId: string;
      movie: Movie | MovieDetail;
      status?: WatchlistStatus;
      existingItem?: WatchlistItem;
    }) => {
      if (existingItem) {
        await removeFromWatchlist(existingItem.id);
        return { action: 'removed', imdbID: movie.imdbID };
      } else {
        const newId = await addToWatchlist(userId, movie, status);
        return { action: 'added', newId, movie };
      }
    },

    // Optimistic Update Callback
    onMutate: async ({ userId, movie, status = 'want_to_watch', existingItem }) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist', userId] });
      const previousWatchlist = queryClient.getQueryData<WatchlistItem[]>(['watchlist', userId]) || [];

      let updatedWatchlist: WatchlistItem[];

      if (existingItem) {
        // Optimistically remove
        updatedWatchlist = previousWatchlist.filter((item) => item.imdbID !== movie.imdbID);
      } else {
        // Optimistically insert
        const tempItem: WatchlistItem = {
          id: `temp-${Date.now()}`,
          userId,
          imdbID: movie.imdbID,
          title: movie.Title,
          year: movie.Year,
          type: movie.Type || 'movie',
          poster: movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
          addedAt: new Date().toISOString(),
          status,
          genre: (movie as MovieDetail).Genre || '',
          runtime: (movie as MovieDetail).Runtime || '',
          director: (movie as MovieDetail).Director || '',
          userRating: 0,
          notes: '',
        };
        updatedWatchlist = [tempItem, ...previousWatchlist];
      }

      queryClient.setQueryData(['watchlist', userId], updatedWatchlist);

      return { previousWatchlist };
    },

    onError: (_err, variables, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(['watchlist', variables.userId], context.previousWatchlist);
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.userId] });
    },
  });
}

// Review Like Mutation Hook with Optimistic Updates
export function useToggleReviewLikeMutation(imdbID: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['reviews', imdbID || 'all'];

  return useMutation({
    mutationFn: async ({ reviewId, userId, isLiked }: { reviewId: string; userId: string; isLiked: boolean }) => {
      await toggleLikeReview(reviewId, userId, isLiked);
    },

    onMutate: async ({ reviewId, userId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousReviews = queryClient.getQueryData<Review[]>(queryKey) || [];

      const updatedReviews = previousReviews.map((rev) => {
        if (rev.id === reviewId) {
          const currentLikedBy = rev.likedBy || [];
          const newLikedBy = isLiked
            ? currentLikedBy.filter((id) => id !== userId)
            : [...currentLikedBy, userId];
          const newLikesCount = Math.max(0, (rev.likesCount || 0) + (isLiked ? -1 : 1));

          return {
            ...rev,
            likedBy: newLikedBy,
            likesCount: newLikesCount,
          };
        }
        return rev;
      });

      queryClient.setQueryData(queryKey, updatedReviews);

      return { previousReviews };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(queryKey, context.previousReviews);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
