import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, GeneratedVideo } from '../types';

/**
 * Generates a video using the Veo model.
 * Handles the polling logic required for video generation operations.
 */
export const generateVideo = async (request: GenerationRequest): Promise<GeneratedVideo> => {
  // CRITICAL: Always instantiate a new client to pick up the latest selected API key from the environment.
  // The environment variable process.env.API_KEY is injected by the platform after selection.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { prompt, image, config } = request;

  console.log("Starting video generation with config:", config);

  let operation;

  try {
    if (image) {
      // Image-to-Video or Text-and-Image-to-Video
      operation = await ai.models.generateVideos({
        model: config.model,
        prompt: prompt || undefined, // Prompt is optional if image is provided, but we usually want both
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

    // Polling loop
    // Video generation can take time (minutes), so we poll gracefully.
    while (!operation.done) {
      // Wait 10 seconds between polls to avoid rate limits and unnecessary checks
      // Guidelines recommend 10s for video operations
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("Polling for video status...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(operation.error.message || "Unknown error during video generation");
    }

    const video = operation.response?.generatedVideos?.[0]?.video;

    if (!video || !video.uri) {
      throw new Error("No video URI returned from the operation.");
    }

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