import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {AI_CONFIG} from '@/config/ai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: AI_CONFIG.modelName, // Use the model name from config
});
