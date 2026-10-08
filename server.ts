import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '25mb' }));

// Shared Gemini client setup (only on server side as required)
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'TarleX',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Gemini Multi-turn Chat API
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, modelType = 'general', enableThinking = false } = req.body;
    
    if (!ai) {
      // Intelligent fallback when API key is not yet configured in runtime
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
      return res.json({
        reply: `Hey! I'm TarleX Copilot 🚀. (Note: Live Gemini Key is configuring). For your query "${lastUserMsg.slice(0, 50)}...": Pro tip: Use dynamic hooks, engaging 3-second reel cuts, and pair with 3-5 niche hashtags like #TarleXCreators #CreativeFlow!`,
        modelUsed: 'mock-copilot',
      });
    }

    // Model selection rules
    // gemini-3.1-pro-preview for complex reasoning & thinking
    // gemini-3.5-flash for general tasks
    // gemini-3.1-flash-lite for fast tasks
    let modelName = 'gemini-3.8-flash';
    if (enableThinking || modelType === 'complex') {
      modelName = 'gemini-3.1-pro-preview';
    } else if (modelType === 'fast') {
      modelName = 'gemini-3.1-flash-lite';
    } else {
      modelName = 'gemini-3.5-flash';
    }

    // Format chat contents
    const systemInstruction = 
      "You are TarleX Copilot, the AI creative companion and social media strategist built into TarleX. " +
      "You assist creators with viral hooks, reel scripts, authentic aesthetic captions, hashtag research, community engagement advice, and profile makeover tips. " +
      "Keep responses energetic, formatted cleanly with bullet points where appropriate, insightful, and concise.";

    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction,
    };

    if (enableThinking && modelName === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Important: do not set maxOutputTokens when thinkingLevel is set
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const replyText = response.text || "I couldn't generate a response. Try asking in another way!";
    return res.json({
      reply: replyText,
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process AI chat request',
    });
  }
});

// Gemini Caption & Hashtag Generator
app.post('/api/gemini/generate-caption', async (req, res) => {
  try {
    const { prompt, tone = 'aesthetic', keywords = [] } = req.body;
    
    if (!ai) {
      return res.json({
        caption: `Chasing moments, not perfection. ✨\n\n#TarleX #VisualDiary #${tone}Vibes`,
        hashtags: ['#TarleX', '#CreatorsOfTarleX', '#VisualMoments', '#GoodEnergy'],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate an engaging social media post caption and 5-8 trending hashtags for TarleX based on: "${prompt}". Tone: ${tone}. Keywords: ${keywords.join(', ')}. Return ONLY the formatted text with caption followed by hashtags on a new line.`,
    });

    const text = response.text || '';
    const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
    const hashtagLine = lines.find((l: string) => l.includes('#')) || '';
    const hashtags = hashtagLine.match(/#[a-zA-Z0-9_]+/g) || ['#TarleX', '#CreateEveryday'];
    const caption = text.replace(hashtagLine, '').trim() || text;

    res.json({ caption, hashtags, raw: text });
  } catch (error: any) {
    console.error('Caption generation error:', error);
    res.status(500).json({ error: error?.message || 'Caption generation failed' });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TarleX server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
