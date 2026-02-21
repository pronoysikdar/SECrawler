// src/config/ai.ts
export const AI_CONFIG = {
  modelName: 'googleai/gemini-2.0-flash', 
  generationConfig: {
    temperature: 0.0,      // 0.0 for the most deterministic (least random) output
    topP: 0.1,             // Low topP to focus on high-probability tokens
    topK: 16,              // Restrict to top K tokens
    maxOutputTokens: 8192, // Allow sufficient length for detailed summaries
  }
};