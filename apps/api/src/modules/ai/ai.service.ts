/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import type {
  AiImageOptions,
  AiImageResponse,
  AiPromptOptions,
  AiTextResponse,
  AiVoiceOptions,
  AiVoiceResponse,
} from "@repo/types";
import { ZodType } from "zod";
import { GeminiTextProvider } from "./providers/gemini-text.provider";
import { MockImageProvider } from "./providers/mock-image.provider";
import { MockVoiceProvider } from "./providers/mock-voice.provider";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly textProvider: GeminiTextProvider,
    private readonly imageProvider: MockImageProvider,
    private readonly voiceProvider: MockVoiceProvider,
  ) {}

  /**
   * Generates text with automatic retries on transient errors per plan.md section 24/29.
   */
  async generateText(prompt: string, options?: AiPromptOptions): Promise<AiTextResponse<string>> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        return await this.textProvider.generateText(prompt, options);
      } catch (error) {
        this.logger.warn(`AI generateText attempt ${attempts} failed: ${(error as Error).message}`);
        if (attempts >= maxAttempts) throw error;
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempts)));
      }
    }

    throw new Error("Failed to generate text after multiple attempts");
  }

  /**
   * Generates structured JSON adhering to a Zod schema with validation & retry pipeline.
   */
  async generateStructuredJson<T>(
    prompt: string,
    schema: ZodType<T, any, any>,
    schemaDescription: string,
    options?: AiPromptOptions,
  ): Promise<AiTextResponse<T>> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await this.textProvider.generateStructuredJson<T>(
          prompt,
          schemaDescription,
          options,
        );

        // Strict Zod output validation pipeline per plan.md section 24
        const validationResult = schema.safeParse(response.content);
        if (validationResult.success) {
          return {
            ...response,
            content: validationResult.data,
          };
        }

        this.logger.warn(
          `AI output failed schema validation on attempt ${attempts}: ${JSON.stringify(validationResult.error.format())}`,
        );
        if (attempts >= maxAttempts) {
          // If schema parse fails on final attempt, return validated fallback if possible or rethrow
          throw new Error(
            `AI output failed schema validation: ${validationResult.error.message}`,
          );
        }
      } catch (error) {
        this.logger.warn(`AI generateStructuredJson attempt ${attempts} failed: ${(error as Error).message}`);
        if (attempts >= maxAttempts) throw error;
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempts)));
      }
    }

    throw new Error("Failed to generate valid structured AI output after retries");
  }

  /**
   * Generates visual image asset preview.
   */
  async generateImage(prompt: string, options?: AiImageOptions): Promise<AiImageResponse> {
    return this.imageProvider.generateImage(prompt, options);
  }

  /**
   * Generates voice narration asset.
   */
  async generateVoice(text: string, options?: AiVoiceOptions): Promise<AiVoiceResponse> {
    return this.voiceProvider.generateVoice(text, options);
  }
}
