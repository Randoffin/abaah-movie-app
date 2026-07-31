# AbaahMovieApp - Prompt Documentation & Refinement

## Original Prompt
> "Build a move app using React, OMDb (or any other available free API Key provider), Firebase. Make available the prompt(s) used via prompt.md. Also provide one area I can improve and how I do to it via improvement.md. You can also provide ai-assistance.md. You can refine this prompt before proceeding. I will like to see your refined prompt before proceeding"

---

## Refined & Expanded Prompt

**Title:** AbaahMovieApp - AI-Enhanced Full-Stack Movie & TV Discovery Application

**Objective:**
Build a high-performance, visually stunning, full-stack Movie & TV Show Discovery and Watchlist platform (**AbaahMovieApp**) using React 19, TypeScript, Tailwind CSS, Firebase Authentication & Firestore, OMDb API / Fallback Movie Database, and Gemini 2.5 AI.

### Key Specifications & Architecture:

1. **Frontend Architecture & Design:**
   - **Modern Aesthetic:** Dark cinematic layout with high contrast, crisp typography, responsive grid views, carousel showcases, and glassmorphism accents.
   - **Core Views:**
     - **Home / Explore:** Trending movies, top-rated cinema, curated genre carousels, and mood-based quick filters.
     - **Search & Discovery:** Instant real-time OMDb live search with filter by year, type (movie/series/episode), genre, and sort options.
     - **Movie / Series Details Modal & Page:** High-res poster display, plot summary, IMDb rating, Metascore, Rotten Tomatoes, Director, Cast, Genre, Awards, Box Office, runtime, and trailer preview link.
     - **Personal Watchlist Manager:** Interactive Firebase Firestore watchlist supporting status tags (`Want to Watch`, `Watching`, `Watched`), personal ratings (1-10 stars), and custom personal notes.
     - **Community Reviews & Ratings:** Real-time Firestore user reviews system allowing logged-in users to publish movie reviews, give star ratings, and like other community reviews.
     - **AI Recommendation Hub:** Smart Gemini-powered Assistant that provides personalized movie recommendations based on user mood, occasion, favorite genres, or custom prompts.

2. **Backend & API Layer (`server.ts`):**
   - **OMDb API Integration Proxy:** Dedicated backend endpoint (`/api/omdb/*`) to securely fetch live movie data from OMDb API with built-in high-quality fallback movie catalog ensuring 100% reliable functionality out-of-the-box.
   - **Server-Side Gemini AI Endpoint:** Integration using `@google/genai` (`/api/ai/recommend` and `/api/ai/analyze-review`) to keep API keys secure while serving AI recommendations, mood matching, and review sentiment tags.

3. **Firebase Cloud Persistence:**
   - **Authentication:** Anonymous single-click login + Email/Password authentication flow with profile avatars.
   - **Firestore Database:** Configured collections for `users`, `watchlists`, `reviews`, and `customLists` with strict Firestore security rules (`firestore.rules`).

4. **Documentation & Developer Resources:**
   - `prompt.md` (this file) documenting original and refined prompts.
   - `improvement.md` detailing architectural enhancement opportunities.
   - `ai-assistance.md` explaining AI features, prompts, and server integration.
