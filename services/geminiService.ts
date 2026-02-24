import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VerseResponse } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key not found");
    throw new Error("API Key not configured");
  }
  return key;
};

// Define the schema for the output
const verseResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, gentle title reflecting the user's emotional state" },
    interpreted_feelings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of identified primary emotions" },
    need: { type: Type.STRING, description: "The underlying psychological or spiritual need identified" },
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "e.g., Psalm 23:1" },
          text: { type: Type.STRING, description: "The verse text" },
          is_paraphrase: { type: Type.BOOLEAN, description: "True if exact wording is uncertain" },
          why_relevant_one_line: { type: Type.STRING, description: "Psychological/Pastoral relevance explanation" },
          link: { type: Type.STRING, description: "BibleGateway link" },
        },
        required: ["reference", "text", "is_paraphrase", "why_relevant_one_line", "link"],
      },
    },
  },
  required: ["title", "interpreted_feelings", "need", "results"],
};

export const fetchVerses = async (
  freeText: string,
  selectedFeelings: string[],
  verseCount: number
): Promise<VerseResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const prompt = `
    User Input:
    - Free text feeling: "${freeText}"
    - Selected feelings: ${selectedFeelings.join(", ")}
    - Desired verse count: ${verseCount}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: verseResponseSchema,
        temperature: 0.7, // Warmth/creativity balance
      },
    });

    if (!response.text) {
      throw new Error("No content generated");
    }

    const data = JSON.parse(response.text) as VerseResponse;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};