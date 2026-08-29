import type {
  AiTextResponse,
  AiPromptOptions,
  AiImageResponse,
  AiImageOptions,
  AiVoiceResponse,
  AiVoiceOptions,
} from "@repo/types";

export interface IAiTextProvider {
  readonly name: string;
  generateText(prompt: string, options?: AiPromptOptions): Promise<AiTextResponse<string>>;
  generateStructuredJson<T>(
    prompt: string,
    schemaDescription: string,
    options?: AiPromptOptions,
  ): Promise<AiTextResponse<T>>;
}

export interface IAiImageProvider {
  readonly name: string;
  generateImage(prompt: string, options?: AiImageOptions): Promise<AiImageResponse>;
}

export interface IAiVoiceProvider {
  readonly name: string;
  generateVoice(text: string, options?: AiVoiceOptions): Promise<AiVoiceResponse>;
}
