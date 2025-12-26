
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const performArabicOCR = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: "Extract all the Arabic text from this image. Return ONLY the plain text content. Preserve the line breaks and the natural flow of the document. Do not provide translations, explanations, or any other text than what is visible in the image."
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]
      },
      config: {
        temperature: 0.1, // Low temperature for accuracy in extraction
      }
    });

    const resultText = response.text || "";
    if (!resultText) {
      throw new Error("The model did not return any text. Please try a clearer image.");
    }
    
    return resultText;
  } catch (error: any) {
    console.error("OCR Service Error:", error);
    throw new Error(error.message || "Failed to process image with Gemini API.");
  }
};
