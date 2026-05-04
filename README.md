# Aura — AI Personalised Perfume Finder

A beautiful, domain-specific AI chatbot that acts as a personal fragrance consultant. Built with React, Vite, and Node.js, and powered by Google's Gemini API.

## Features
- 🌸 **Domain-Specific AI**: Exclusively focused on perfumes, fragrances, and scent science. Refuses to answer unrelated topics.
- 🎨 **Luxurious UI**: High-end boutique aesthetic featuring a dark mode color palette, glassmorphism, and smooth micro-animations.
- 🧠 **Contextual Memory**: Remembers user preferences (gender, budget, occasion, climate, etc.) throughout the conversation.
- ⚡ **Real-Time Quick Replies**: Context-aware suggestions that change based on what Aura is asking.
- 🛠️ **Resilient Backend**: Express proxy server with built-in retry logic and exponential backoff to handle API rate limits gracefully.

## Tech Stack
- **Frontend**: React 19, Vite, Vanilla CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini API (`gemini-2.0-flash`)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development servers (runs both client and server concurrently):
   ```bash
   npm run dev
   ```

## Architecture
The application uses a secure proxy pattern. The React frontend never communicates with the Gemini API directly. Instead, it sends the conversation history to the Express backend (`http://localhost:3001/api/chat`), which injects a heavily engineered system prompt and the secret API key before forwarding the request to Google.
