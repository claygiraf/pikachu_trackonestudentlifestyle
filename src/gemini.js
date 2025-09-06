import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.GEMINI_API_KEY;

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(geminiApiKey);

export { genAI };
