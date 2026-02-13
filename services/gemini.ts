
import { GoogleGenAI, Type } from "@google/genai";
import { Choice, RoundHistory } from "../types";

export const getGeminiMove = async (history: RoundHistory[]): Promise<Choice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Minimal history context to keep it fast
  const recentHistory = history.slice(0, 3).map(r => `U:${r.player1},AI:${r.player2}`).join(',');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Quickly pick rock, paper, or scissors to beat a human. History: ${recentHistory || 'None'}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            choice: {
              type: Type.STRING,
              enum: ['rock', 'paper', 'scissors']
            }
          },
          required: ["choice"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"choice": "rock"}');
    return result.choice as Choice;
  } catch (error) {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * 3)];
  }
};

export const getGeminiCommentary = async (result: string, p1: Choice, p2: Choice): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Match Result: ${result}. P1: ${p1}, P2: ${p2}. Give a ultra-short, witty 1-sentence sport commentary.`,
    });
    return response.text?.trim() || "What a move!";
  } catch (error) {
    return "Stunning performance!";
  }
};
