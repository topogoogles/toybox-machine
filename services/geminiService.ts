import { GoogleGenAI } from "@google/genai";
import { AspectRatio, GenerationResult } from "../types";

const STYLE_PROMPT = `Isometric 3D product package of the reference image in the style of a collectible toy box and futuristic NFT room. Ultra-clean isometric composition showing a miniature interior scene inside a transparent plastic blister package with a cardboard backing on a dark background. The package is shaped like a small room, with smooth white walls, light wooden floor, and a large front window of clear plastic. Soft neon rim lighting in yellow and purple reflecting on the plastic edges, subtle reflections and shadows, high gloss materials, global illumination, 3D render, octane style, ultra‑high resolution, no text cut-offs, centered composition, empty dark gradient background.`;

export const generateToyBox = async (
  prompt: string,
  base64Image: string | null,
  mimeType: string,
  ratio: AspectRatio
): Promise<GenerationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the full prompt
  const finalPrompt = base64Image
    ? `${prompt ? `Instructions: ${prompt}. ` : ""}Transform this image into the following style: ${STYLE_PROMPT}`
    : `${prompt}. ${STYLE_PROMPT}`;

  const parts: any[] = [];

  // Add image if present (Input image for editing/reference)
  if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    });
  }

  // Add text prompt
  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: ratio,
        },
      },
    });

    let result: GenerationResult = { imageUrl: null, text: null };

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          result.imageUrl = `data:image/png;base64,${base64EncodeString}`;
        } else if (part.text) {
          result.text = part.text;
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert prompt engineer for AI image generation. 
      Improve the following user prompt to create a stunning, highly detailed Isometric 3D Toy Box/NFT Room style image. 
      Keep the user's original subject and intent clear, but add keywords for lighting, texture, and atmosphere that fit the "Toy Box Blister Pack" aesthetic.
      Return ONLY the enhanced prompt text, no explanations.
      
      User Prompt: "${originalPrompt}"`,
    });

    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    return originalPrompt; // Fallback to original if fails
  }
};

export const generateBrainstorming = async (
  context: string,
  base64Image: string | null = null,
  mimeType: string = ""
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // Add image part if available for multimodal brainstorming
  if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    });
  }

  let promptText = "";

  if (base64Image) {
    promptText = context.trim()
      ? `Analyze the attached image. Based on its visual elements and the idea "${context}", generate 3 creative, distinct 3D Isometric Toy Box/NFT Room concepts. Format as a concise numbered list (1., 2., 3.) with short descriptions suitable for image generation.`
      : `Analyze the attached image. Extract its key themes and styles to generate 3 creative 3D Isometric Toy Box/NFT Room concepts based on it. Format as a concise numbered list (1., 2., 3.) with short descriptions suitable for image generation.`;
  } else {
    promptText = context.trim() 
      ? `Based on the idea "${context}", generate 3 creative, distinct, and highly visual concepts for a 3D Isometric Toy Box/NFT Room. Format the output as a concise, numbered list (1., 2., 3.) with short punchy descriptions suitable for image generation prompts. Do not add intro text.`
      : `Generate 3 random, creative, and futuristic concepts for a 3D Isometric Toy Box/NFT Room. Think sci-fi, cyberpunk, or fantasy. Format as a concise, numbered list (1., 2., 3.) with short punchy descriptions.`;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
    });

    return response.text?.trim() || "1. Cyberpunk Ramen Shop\n2. Underwater Coral Reef Lab\n3. Mars Colony Greenhouse";
  } catch (error) {
    console.error("Brainstorming Error:", error);
    return "Failed to brainstorm ideas.";
  }
}