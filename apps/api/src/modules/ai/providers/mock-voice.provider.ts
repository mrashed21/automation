import { Injectable } from "@nestjs/common";
import type { IAiVoiceProvider } from "../interfaces/ai-provider.interface";
import type { AiVoiceOptions, AiVoiceResponse } from "@repo/types";

@Injectable()
export class MockVoiceProvider implements IAiVoiceProvider {
  readonly name = "mock-voice";

  async generateVoice(text: string, options?: AiVoiceOptions): Promise<AiVoiceResponse> {
    const wordCount = text.trim().split(/\s+/).length;
    const estimatedDurationSeconds = Math.max(3, Math.round(wordCount / 2.5)); // ~150 words/min

    return {
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      durationSeconds: estimatedDurationSeconds,
      model: options?.model || "eleven_multilingual_v2",
      provider: this.name,
      usage: {
        promptTokens: text.length,
        completionTokens: 0,
        totalTokens: text.length,
        estimatedCostUsd: Number((text.length * 0.00003).toFixed(4)),
        durationMs: 850,
      },
    };
  }
}
