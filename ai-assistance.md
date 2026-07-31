# AbaahMovieApp - AI Assistance Integration Overview

AbaahMovieApp integrates **Google Gemini AI (`gemini-2.5-flash`)** via a secure server-side proxy route (`/api/ai/recommend` and `/api/ai/analyze-review`) using the official `@google/genai` TypeScript SDK.

---

## AI Features & Capabilities

### 1. Smart Mood & Context Movie Matcher
Users can choose their mood (e.g. *Thought-Provoking*, *Adrenaline Surge*, *Cozy & Heartwarming*, *Dark & Mind-Bending*), time commitment, or input custom natural language prompts like:
> *"I want a 90s sci-fi thriller with a plot twist similar to the Matrix"*

**System Strategy:**
The backend communicates with Gemini 2.5 to process the request and output structured JSON containing recommended movie titles, years, IMDb search keywords, match percentages, and compelling AI reasoning tailored to the user's prompt.

### 2. AI Review Sentiment & Key Theme Analyzer
When community members post movie reviews, Gemini evaluates the review text to generate:
- **Sentiment Indicator:** Positive, Mixed, or Critical
- **Key Highlight Tags:** e.g., `#MasterpieceCinematography`, `#SlowBurn`, `#OutstandingPerformance`

### 3. Smart Watchlist AI Analyzer & Curator
The AI Assistant can analyze the user's current saved Firestore Watchlist and generate personalized recommendations on what to watch next based on their viewing habits and current time availability.

---

## Technical Integration Architecture

```
[React Client UI]
       │
       ▼ (POST /api/ai/recommend)
[Express Server (`server.ts`)]
       │
       ▼ (SDK @google/genai with GEMINI_API_KEY)
[Google Gemini 2.5 Model]
       │
       ▼ (Returns Structured JSON)
[Express Server Format & Sanitize]
       │
       ▼
[React Rendered Movie Recommendations]
```

### Server Code Snippet Example (`server.ts`):
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/ai/recommend', async (req, res) => {
  const { mood, genre, query } = req.body;
  const prompt = `Act as an expert film critic. Recommend 5 movies for mood "${mood}", genre "${genre}", prompt "${query}". Respond ONLY with JSON array...`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  res.json(JSON.parse(response.text));
});
```
