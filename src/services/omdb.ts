import { Movie, MovieDetail } from '../types';

export async function searchMovies(query: string, type?: string, year?: string): Promise<Movie[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('s', query);
    if (type) params.append('type', type);
    if (year) params.append('y', year);

    const res = await fetch(`/api/omdb/search?${params.toString()}`);
    const data = await res.json();
    if (data.Response === 'True' && Array.isArray(data.Search)) {
      return data.Search;
    }
    return [];
  } catch (err) {
    console.error('Error fetching movies from API:', err);
    return [];
  }
}

export async function getMovieDetail(imdbID: string, title?: string): Promise<MovieDetail | null> {
  try {
    const params = new URLSearchParams();
    if (imdbID) params.append('i', imdbID);
    if (title) params.append('t', title);

    const res = await fetch(`/api/omdb/detail?${params.toString()}`);
    const data = await res.json();
    if (data.Response === 'True') {
      return data as MovieDetail;
    }
    return null;
  } catch (err) {
    console.error('Error fetching movie detail from API:', err);
    return null;
  }
}
