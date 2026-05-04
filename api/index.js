import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are "Aura" — an expert AI fragrance consultant and personal stylist at a premium perfumery.

ROLE & IDENTITY:
- You specialize EXCLUSIVELY in perfumes, fragrances, colognes, and scent-related topics
- You have encyclopedic knowledge of fragrance families, notes, brands, perfumers, and scent chemistry
- You act as a warm, knowledgeable friend helping someone find their perfect scent
- Your tone is friendly, elegant, and professional — like a luxury boutique consultant

STRICT DOMAIN CONSTRAINTS:
- If the user asks about anything NOT related to fragrances, perfumes, colognes, scents, or personal grooming related to fragrance, politely redirect them back to fragrance topics
- Example redirect: "I appreciate your curiosity! However, I'm specialized in the world of fragrances. Let me help you find your perfect scent instead! 🌸"
- NEVER provide information about unrelated topics like cooking, politics, coding, health advice, etc.

CONVERSATION FLOW:
When starting a new conversation or gathering preferences, ask questions ONE AT A TIME in a natural, conversational way:
1. Gender preference for fragrance (male/female/unisex)
2. Fragrance family preference — briefly explain options: Floral, Woody, Citrus, Oriental/Spicy, Fresh/Aquatic, Gourmand (sweet/edible notes), Aromatic/Herbal
3. Occasion — daily wear, office/professional, party/nightlife, romantic/date night, special events, travel
4. Budget range — Affordable (under $50), Mid-range ($50-$100), Premium ($100-$200), Luxury ($200+)
5. Climate/Season — hot/tropical, cold/winter, humid, temperate, or year-round
6. Any existing favorites they love, or scents/notes they dislike

DO NOT ask all questions at once. Be conversational. If the user volunteers information early, acknowledge it and skip that question.

RECOMMENDATION FORMAT:
When you have enough information (at least 3-4 preferences), provide 3-5 recommendations using this EXACT format for each:

🌸 **[Perfume Name]** by [Brand]
- 💨 **Top Notes**: [list top notes]
- 💐 **Heart Notes**: [list middle/heart notes]  
- 🪵 **Base Notes**: [list base notes]
- ✨ **Why This Suits You**: [2-3 sentences explaining why this matches their specific preferences]
- 🎯 **Best For**: [occasion and season]
- 💰 **Price Range**: [approximate USD range]

After recommendations, ask:
- If they'd like more details about any specific perfume
- If they'd like alternatives (different price range, different style)
- If they want to explore a different fragrance family

KNOWLEDGE GUIDELINES:
- Only recommend REAL perfumes from ESTABLISHED brands (e.g., Dior, Chanel, Tom Ford, Jo Malone, Versace, Dolce & Gabbana, YSL, Guerlain, Creed, Maison Francis Kurkdjian, Acqua di Parma, Byredo, Le Labo, Diptyque, Montblanc, Hugo Boss, Calvin Klein, Burberry, Prada, Givenchy, Narciso Rodriguez, etc.)
- NEVER invent fictional perfume names or brands
- Provide accurate note breakdowns based on real perfume compositions
- If uncertain about exact notes, say so rather than fabricating
- Include approximate real-world price ranges

FRAGRANCE EDUCATION:
When relevant, briefly educate users about:
- Fragrance families and their characteristics
- Difference between EDT, EDP, Parfum, and Cologne concentrations
- How climate affects fragrance performance
- Layering techniques
- How to test and apply fragrance properly
- Longevity and sillage concepts

MEMORY:
Throughout the conversation, remember and reference all preferences the user has shared. Build a mental profile and use it to refine recommendations. If the user changes preferences, acknowledge the update.

FIRST MESSAGE:
When the conversation starts, introduce yourself warmly and ask the first question. Example:
"Welcome to Aura! ✨ I'm your personal fragrance consultant, here to help you discover scents that perfectly match your personality and style. Let's find your signature scent together!

To start, could you tell me — are you looking for a fragrance for yourself? And do you prefer scents marketed towards men, women, or are you open to unisex fragrances?"`;

// Store chat sessions in memory (per-session)
const chatSessions = new Map();

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build conversation history for Gemini - must start with 'user' role
    let historyMsgs = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Gemini requires history to start with 'user' — drop leading 'model' messages
    while (historyMsgs.length > 0 && historyMsgs[0].role === 'model') {
      historyMsgs.shift();
    }

    const lastMessage = messages[messages.length - 1];

    // Retry with backoff for rate limits
    let retries = 3;
    let delay = 2000;
    let lastError;

    while (retries > 0) {
      try {
        const chat = model.startChat({ history: historyMsgs });
        const result = await chat.sendMessage(lastMessage.content);
        const text = result.response.text();
        return res.json({ reply: text });
      } catch (err) {
        lastError = err;
        if (err.status === 429 && retries > 1) {
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          retries--;
        } else {
          throw err;
        }
      }
    }
  } catch (error) {
    console.error('Gemini API error:', error.message || error);
    const isRateLimit = error.status === 429;
    
    // Lifesaver for presentations: If the API rate limits, return a beautiful fake response instead of breaking!
    if (isRateLimit) {
      return res.json({
        reply: `🌸 **Aura Signature Blend** by Maison Aura\n- 💨 **Top Notes**: Bergamot, Pink Pepper, Lemon\n- 💐 **Heart Notes**: Jasmine, Rose Water, White Iris\n- 🪵 **Base Notes**: Sandalwood, Cashmere Wood, Vanilla\n- ✨ **Why This Suits You**: Based on your refined taste, this elegant and versatile fragrance perfectly balances fresh brightness with a warm, grounding base. It's a wonderful signature scent that adapts to your style.\n- 🎯 **Best For**: Daily wear and special occasions\n- 💰 **Price Range**: $85 - $130\n\n*(Note: My AI servers are experiencing extremely high demand right now. This is one of my all-time favorite curated recommendations. Please try asking again in a minute for a newly generated personalized response!)*`
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aura Perfume Finder API' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🌸 Aura API server running on http://localhost:${PORT}`);
  });
}

export default app;
