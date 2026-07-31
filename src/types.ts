export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  Poster: string;
  Genre?: string;
  imdbRating?: string;
  Plot?: string;
}

export interface RatingSource {
  Source: string;
  Value: string;
}

export interface MovieDetail extends Movie {
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Ratings?: RatingSource[];
  Metascore?: string;
  imdbVotes?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  TotalSeasons?: string;
  Response?: string;
  Error?: string;
}

export type WatchlistStatus = 'want_to_watch' | 'watching' | 'watched';

export interface WatchlistItem {
  id: string;
  userId: string;
  imdbID: string;
  title: string;
  year: string;
  type: string;
  poster: string;
  addedAt: string;
  status: WatchlistStatus;
  userRating?: number;
  notes?: string;
  genre?: string;
  runtime?: string;
  director?: string;
}

export interface Review {
  id: string;
  imdbID: string;
  movieTitle: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1 to 5 stars
  reviewText: string;
  createdAt: string;
  likesCount: number;
  likedBy?: string[];
  sentiment?: 'positive' | 'mixed' | 'critical';
  tags?: string[];
}

export interface AIRecommendation {
  title: string;
  year: string;
  imdbID?: string;
  genre: string;
  poster?: string;
  matchPercentage: number;
  reason: string;
  synopsis: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}
