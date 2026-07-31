import { AIRecommendation } from '../types';

export interface AIRecommendOptions {
  mood?: string;
  genre?: string;
  query?: string;
  watchHistory?: string[];
}

export async function getAiRecommendations(options: AIRecommendOptions): Promise<{ recommendations: AIRecommendation[]; notice?: string }> {
  try {
    const res = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.recommendations)) {
      return { recommendations: data.recommendations, notice: data.fallbackNotice };
    }
    return { recommendations: [] };
  } catch (err) {
    console.error('AI recommendation error:', err);
    return { recommendations: [] };
  }
}

export async function analyzeReviewSentiment(reviewText: string, movieTitle: string): Promise<{ sentiment?: string; tags?: string[] }> {
  try {
    const res = await fetch('/api/ai/analyze-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewText, movieTitle }),
    });
    return await res.json();
  } catch (err) {
    console.error('AI review analysis error:', err);
    return { sentiment: 'positive', tags: ['#Recommended'] };
  }
}
