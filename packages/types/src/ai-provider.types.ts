
/** AI Provider interface contracts */
export type AiModelCapability = "text" | "image" | "voice" | "video" | "embedding";

export interface AiPromptOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: "text" | "json";
  stopSequences?: string[];
}

export interface AiUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
}

export interface AiTextResponse<T = string> {
  content: T;
  rawText: string;
  model: string;
  provider: string;
  usage: AiUsageMetrics;
  finishReason?: string;
}

export interface AiImageOptions {
  model?: string;
  width?: number;
  height?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  style?: string;
}

export interface AiImageResponse {
  imageUrl: string;
  promptUsed: string;
  model: string;
  provider: string;
  usage: AiUsageMetrics;
}

export interface AiVoiceOptions {
  model?: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
  format?: "mp3" | "wav";
  stability?: number;
  similarityBoost?: number;
}

export interface AiVoiceResponse {
  audioUrl: string;
  audioBuffer?: Buffer;
  durationSeconds: number;
  model: string;
  provider: string;
  usage: AiUsageMetrics;
}


export interface AiTextProvider {
  readonly name: string;
  generateText(prompt: string, options?: AiPromptOptions): Promise<AiTextResponse<string>>;
  generateStructuredJson<T>(
    prompt: string,
    schemaDescription: string,
    options?: AiPromptOptions,
  ): Promise<AiTextResponse<T>>;
}

export interface AiImageProvider {
  readonly name: string;
  generateImage(prompt: string, options?: AiImageOptions): Promise<AiImageResponse>;
}

export interface AiVoiceProvider {
  readonly name: string;
  generateVoice(text: string, options?: AiVoiceOptions): Promise<AiVoiceResponse>;
}
