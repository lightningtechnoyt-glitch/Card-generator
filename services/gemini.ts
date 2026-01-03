
import { GoogleGenAI } from "@google/genai";

export const getCreativeSuggestions = async (subject: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, fun, and energetic academic quote (max 5 words) for a school book label about "${subject}". Use emojis!`,
      config: {
        maxOutputTokens: 30,
        temperature: 0.9,
      }
    });
    return response.text?.trim() || "Learning is an adventure! ✨";
  } catch (error) {
    return "Learning is a superpower! ⚡";
  }
};

export const generateSubjectImage = async (subject: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A cute, fun, minimalist flat-style cartoon vector illustration of a single object representing "${subject}". Thick black outlines, bright cheerful colors, white background. Kawaii style, simple and clean.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
