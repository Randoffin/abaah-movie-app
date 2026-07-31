# AbaahMovieApp - Movie & TV Discovery Platform

AbaahMovieApp is a full-stack Movie & TV Show Discovery and Watchlist platform built with React 19, TypeScript, Tailwind CSS, Firebase Authentication & Firestore, OMDb API proxying, and Gemini 2.5 AI.

---

## Key Features

1. **OMDb & Cinema Catalog Integration:**
   - Real-time search and detailed view for movies and TV series.
   - Comprehensive metadata including IMDb ratings, Metascore, Rotten Tomatoes, plot, cast, director, box office, awards, and runtime.
   - Resilient fallback catalog ensuring 100% application uptime.

2. **Firebase Firestore & Authentication:**
   - One-click guest sign-in & Email/Password authentication.
   - Cloud watchlist persistence synced in real-time across devices.
   - Custom status tracking (`Want to Watch`, `Watching`, `Watched`), personal 10-star rating system, and private notes log.
   - Community critiques and reviews system with real-time upvoting.

3. **Gemini 2.5 AI Movie Companion:**
   - Smart mood, genre, and custom natural language prompt movie matcher.
   - AI sentiment & key theme tag analysis for community film critiques.
   - AI curator for personal watchlists.

---

## Required Project Documentation Files

As requested by the prompt, the following developer documentation files are included in the repository:

- [`prompt.md`](./prompt.md) - Contains the original prompt and the refined prompt used to architect and construct this application.
- [`improvement.md`](./improvement.md) - Highlights a detailed key architectural area for improvement (Client-Side Caching & Offline Optimistic State) along with step-by-step implementation code.
- [`ai-assistance.md`](./ai-assistance.md) - Details the Gemini 2.5 AI capabilities, prompt engineering, and server-side proxy integration patterns.

---

## Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend:** Node.js Express server (`server.ts`) bundled via `esbuild`.
- **Database & Auth:** Firebase Firestore & Firebase Auth (`firebase-applet-config.json`, `firestore.rules`).
- **AI Integration:** `@google/genai` TypeScript SDK using `gemini-2.5-flash`.
- **Build Tools:** Vite 6, tsx, esbuild.
