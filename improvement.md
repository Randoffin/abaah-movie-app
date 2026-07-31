# AbaahMovieApp - Architectural Improvement Guide

## Key Area to Improve: Client-Side Caching & Off-line Optimistic UI State Management

While AbaahMovieApp utilizes Firebase Firestore for cloud persistence and a server API proxy for OMDb requests, adding a **React Query (TanStack Query) / SWR caching layer** alongside **IndexedDB / LocalStorage fallback caching** would significantly enhance user experience, network efficiency, and offline responsiveness.

---

## Why Improvement is Needed
1. **Network Redundancy:** Re-fetching details for movies that the user has already clicked in the current session triggers repeated OMDb API requests.
2. **Offline Experience:** If a user loses internet connectivity, they currently cannot view previously loaded movie details or cached search results.
3. **Instant UI Feedback:** Instant optimistic updates for watchlist status changes and review likes will eliminate waiting for Firestore roundtrips.

---

## Actionable Step-by-Step Implementation Plan

### Step 1: Add TanStack Query (React Query)
Install `@tanstack/react-query`:
```bash
npm install @tanstack/react-query
```

### Step 2: Configure Query Client with Custom Cache Times
In `src/main.tsx` or a dedicated provider wrapper:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // Keep movie details fresh for 30 minutes
      cacheTime: 1000 * 60 * 60 * 24, // Cache in memory for 24 hours
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
```

### Step 3: Implement Optimistic Updates for Watchlist & Reviews
When a user adds a movie to their Firestore Watchlist or likes a review, update the React Query cache immediately before the network promise resolves:

```tsx
const useToggleWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movie: MovieItem) => {
      return await saveToFirestoreWatchlist(movie);
    },
    onMutate: async (newMovie) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = queryClient.getQueryData(['watchlist']);

      // Optimistically insert new movie into local state cache
      queryClient.setQueryData(['watchlist'], (old: any) => [...(old || []), newMovie]);

      return { previousWatchlist };
    },
    onError: (err, newMovie, context) => {
      // Rollback to previous state on failure
      queryClient.setQueryData(['watchlist'], context?.previousWatchlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};
```

---

## Expected Outcomes
- **Zero Latency Navigation:** Movie details open instantly from in-memory cache when re-visited.
- **50%+ Reduction in API Calls:** Eliminates redundant requests to OMDb.
- **Seamless Offline Support:** Previously fetched movies and watchlist state remain accessible even without an active network connection.

---

## Implementation Status & Verification

This improvement has been **fully implemented and verified** in the codebase:

1. **TanStack Query Setup:** `@tanstack/react-query` configured in `src/services/queryClient.ts` and wrapped in `src/main.tsx` with a 30-minute stale time and 24-hour memory retention.
2. **Offline Fallback Storage:** Implemented in `src/services/queryClient.ts` using LocalStorage serialization to cache search results and movie details for offline access.
3. **Optimistic UI State:** Built into `src/hooks/useMovieQueries.ts`:
   - `useToggleWatchlistMutation`: Instantly toggles watchlist state on user click with automatic rollback on network failure.
   - `useToggleReviewLikeMutation`: Instantly updates review upvote count and like state on user click.
4. **Instant Modal Loading:** `MovieDetailModal` uses `useMovieDetail` for zero-latency modal popup when re-visiting movie titles.

