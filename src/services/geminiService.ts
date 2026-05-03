import { GoogleGenAI } from "@google/genai";
import { AutoPart, PartCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async identifyPart(prompt: string, base64Image?: string): Promise<Partial<AutoPart>> {
    try {
      const parts: any[] = [{ text: `Identify this Nigerian auto part based on the following context. 
      Respond ONLY in JSON format with fields: name, brand, category, estimatedPrice (in Naira as number), compatibleModels (array of strings), and description.
      Valid categories are: Engine, Transmission, Suspension, Brakes, Electrical, Body, Interior, Cooling, Lighting, Other.
      Context: ${prompt}` }];

      if (base64Image) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanJson);

      return {
        name: result.name || '',
        brand: result.brand || '',
        category: (result.category as PartCategory) || 'Other',
        price: result.estimatedPrice || 0,
        compatibleModels: result.compatibleModels || [],
        description: result.description || '',
      };
    } catch (error) {
      console.error("Gemini failed to identify part:", error);
      throw error;
    }
  }
};
