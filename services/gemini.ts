import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, GeneratedVideo } from '../types';

/**
 * Generates a video using the Veo model.
 * Handles the polling logic required for video generation operations.
 */
export const generateVideo = async (request: GenerationRequest): Promise<GeneratedVideo> => {
  // CRITICAL: Always instantiate a new client to pick up the latest selected API key from the environment.
  // The environment variable process.env.API_KEY is injected by the platform after selection.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
      // Differentiate error message based on environment
      if (typeof window !== 'undefined' && window.aistudio) {
         throw new Error("API Key is missing. Please select a valid paid API key.");
      } else {
         throw new Error("API Key is missing. Please add 'API_KEY' to your .env file or Vercel Environment Variables.");
      }
  }
  const ai = new GoogleGenAI({ apiKey });

  const { prompt, image, config } = request;

  console.log("Starting video generation with config:", config);

  let operation;

  try {
    if (image) {
      // Image-to-Video or Text-and-Image-to-Video
      // Prompt is optional when image is provided.
      operation = await ai.models.generateVideos({
        model: config.model,
        prompt: prompt ? prompt : undefined, 
        image: {
          imageBytes: image.data,
          mimeType: image.mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: config.resolution,
          aspectRatio: config.aspectRatio,
        },
      });
    } else {
      // Text-to-Video
      // Prompt is required.
      if (!prompt) {
          throw new Error("Prompt is required for text-to-video generation.");
      }
      operation = await ai.models.generateVideos({
        model: config.model,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: config.resolution,
          aspectRatio: config.aspectRatio,
        },
      });
    }

    console.log("Operation started:", operation);

    // Polling loop
    // Video generation can take time (minutes), so we poll gracefully.
    while (!operation.done) {
      // Wait 10 seconds between polls to avoid rate limits and unnecessary checks
      // Guidelines recommend 10s for video operations
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("Polling for video status...");
      
      // Pass the operation object itself to update status
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      console.error("Operation failed with error:", operation.error);
      throw new Error(operation.error.message || "Unknown error during video generation");
    }

    const video = operation.response?.generatedVideos?.[0]?.video;

    if (!video || !video.uri) {
      console.error("Operation done but no video URI found:", operation);
      throw new Error("No video URI returned from the operation.");
    }

    console.log("Video generation successful:", video.uri);

    return {
      uri: video.uri,
    };

  } catch (error: any) {
    console.error("Video generation failed:", error);
    // Check for specific API Key issues or "Requested entity was not found"
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API Key session expired or invalid. Please re-select your API key.");
    }
    throw error;
  }
};