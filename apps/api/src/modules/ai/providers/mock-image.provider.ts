import { Injectable } from "@nestjs/common";
import type { AiImageOptions, AiImageResponse } from "@repo/types";
import type { IAiImageProvider } from "../interfaces/ai-provider.interface";

@Injectable()
export class MockImageProvider implements IAiImageProvider {
  readonly name = "mock-image";

  async generateImage(prompt: string, options?: AiImageOptions): Promise<AiImageResponse> {
  
    const durationMs = 1200;

    return {
      imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
      promptUsed: prompt,
      model: options?.model || "imagen-3",
      provider: this.name,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: 0,
        totalTokens: Math.ceil(prompt.length / 4),
        estimatedCostUsd: 0.02,
        durationMs,
      },
    };
  }
}
