import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  arrayUnion,
  arrayRemove,
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';
import { WatchlistItem, WatchlistStatus, Review, MovieDetail, Movie } from '../types';

// Watchlist Firestore handlers
export function subscribeWatchlist(userId: string, onUpdate: (items: WatchlistItem[]) => void) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  const q = query(
    collection(db, 'watchlists'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const items: WatchlistItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as WatchlistItem);
    });
    // Sort in memory by addedAt descending
    items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    onUpdate(items);
  }, (err) => {
    console.error('Watchlist subscribe error:', err);
    onUpdate([]);
  });
}

export async function addToWatchlist(
  userId: string, 
  movie: Movie | MovieDetail, 
  status: WatchlistStatus = 'want_to_watch'
): Promise<string> {
  const docData = {
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

  const ref = await addDoc(collection(db, 'watchlists'), docData);
  return ref.id;
}

export async function updateWatchlistItem(itemId: string, updates: Partial<WatchlistItem>) {
  const docRef = doc(db, 'watchlists', itemId);
  await updateDoc(docRef, updates);
}

export async function removeFromWatchlist(itemId: string) {
  const docRef = doc(db, 'watchlists', itemId);
  await deleteDoc(docRef);
}

// Community Reviews Firestore handlers
export function subscribeReviews(imdbID: string | null, onUpdate: (reviews: Review[]) => void) {
  const reviewsRef = collection(db, 'reviews');
  let q = query(reviewsRef);
  if (imdbID) {
    q = query(reviewsRef, where('imdbID', '==', imdbID));
  }

  return onSnapshot(q, (snapshot) => {
    const reviews: Review[] = [];
    snapshot.forEach((docSnap) => {
      reviews.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as Review);
    });
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(reviews);
  }, (err) => {
    console.error('Reviews subscribe error:', err);
    onUpdate([]);
  });
}

export async function addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'likesCount' | 'likedBy'>) {
  const docData = {
    ...reviewData,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedBy: [],
  };
  const ref = await addDoc(collection(db, 'reviews'), docData);
  return ref.id;
}

export async function toggleLikeReview(reviewId: string, userId: string, isLiked: boolean) {
  const reviewRef = doc(db, 'reviews', reviewId);
  if (isLiked) {
    await updateDoc(reviewRef, {
      likesCount: increment(-1),
      likedBy: arrayRemove(userId),
    });
  } else {
    await updateDoc(reviewRef, {
      likesCount: increment(1),
      likedBy: arrayUnion(userId),
    });
  }
}
