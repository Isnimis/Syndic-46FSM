import { GoogleGenAI, Type } from "@google/genai";
import type { IncidentAnalysis } from '../types';

// FIX: Initialize the GoogleGenAI client according to the coding guidelines.
// The API key is sourced directly from `process.env.API_KEY` and is assumed to
// be available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIncidentDescription = async (description: string): Promise<IncidentAnalysis | null> => {
    try {
        const prompt = `Analyse la description de l'incident suivante dans une copropriété et fournis une évaluation structurée. La description est : "${description}". Pense aux actions immédiates, aux personnes à contacter (plombier, électricien, etc.) et aux communications nécessaires pour les résidents. Suggère des actions claires et concises.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priority: {
                            type: Type.STRING,
                            description: "La priorité de l'incident (Basse, Moyenne, ou Haute).",
                            enum: ["Basse", "Moyenne", "Haute"]
                        },
                        category: {
                            type: Type.STRING,
                            description: "Une catégorie pour l'incident (ex: Plomberie, Électricité, Parties Communes, Sécurité)."
                        },
                        suggestedActions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "Une liste de 2 à 4 actions recommandées pour résoudre l'incident."
                        }
                    },
                    required: ["priority", "category", "suggestedActions"]
                }
            }
        });

        // FIX: Trim whitespace and handle potential markdown code fences from the API response before parsing JSON.
        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const analysisResult = JSON.parse(jsonText) as IncidentAnalysis;
        
        return analysisResult;

    } catch (error) {
        console.error("Error analyzing incident with Gemini API:", error);
        return null;
    }
};