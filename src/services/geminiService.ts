export interface GenerateCaptionOptions {
  prompt: string;
  tone?: 'aesthetic' | 'witty' | 'minimalist' | 'inspiring' | 'storytelling';
  keywords?: string[];
}

export async function generateAiCaption(options: GenerateCaptionOptions): Promise<{
  caption: string;
  hashtags: string[];
}> {
  try {
    const res = await fetch('/api/gemini/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      throw new Error('Server returned ' + res.status);
    }

    const data = await res.json();
    return {
      caption: data.caption || 'Creating everyday magic ✨',
      hashtags: data.hashtags || ['#TarleX', '#CreateEveryday'],
    };
  } catch (error) {
    console.warn('AI Caption fallback triggered', error);
    // Graceful offline fallback
    const toneTags: Record<string, string[]> = {
      aesthetic: ['#VisualDiary', '#AestheticMoments', '#SoftFocus', '#TarleX'],
      witty: ['#DailyGrind', '#SendHelp', '#Relatable', '#TarleX'],
      minimalist: ['#LessIsMore', '#QuietMoments', '#FormAndLight', '#TarleX'],
      inspiring: ['#LevelUp', '#CreativeEnergy', '#KeepGoing', '#TarleX'],
      storytelling: ['#BehindTheScenes', '#NotesOnCraft', '#FieldNotes', '#TarleX'],
    };
    return {
      caption: `Capturing the unseen in the everyday. Crafted with intention. ✨`,
      hashtags: toneTags[options.tone || 'aesthetic'] || ['#TarleX', '#CreateEveryday'],
    };
  }
}

export async function sendChatMessage(
  messages: { role: 'user' | 'model'; content: string }[],
  options?: {
    modelType?: 'general' | 'complex' | 'fast';
    enableThinking?: boolean;
  }
): Promise<{ reply: string; modelUsed: string }> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        modelType: options?.modelType || 'general',
        enableThinking: options?.enableThinking || false,
      }),
    });

    if (!res.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await res.json();
    return {
      reply: data.reply || "Let me know what you'd like to work on!",
      modelUsed: data.modelUsed || 'gemini-3.5-flash',
    };
  } catch (error) {
    console.warn('Gemini chat fallback', error);
    return {
      reply: "I'm currently assisting your session in creative mode! Tip: Clean composition with strong lead lines and 3 targeted hashtags drive optimal TarleX discovery.",
      modelUsed: 'copilot-fallback',
    };
  }
}
