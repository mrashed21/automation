import type { Nullable } from "./common.types";

/** Script structural section types */
export type ScriptSectionType =
  | "hook"
  | "intro"
  | "body"
  | "climax"
  | "call-to-action"
  | "outro";

/** Individual script section with timing & visual prompt directives */
export interface ScriptSectionDto {
  id: string;
  order: number;
  type: ScriptSectionType;
  heading: string;
  narration: string;
  visualCue: string;
  estimatedDurationSeconds: number;
  wordCount: number;
}

/** Script document */
export interface ScriptDto {
  id: string;
  contentId: string;
  workspaceId: string;
  currentVersion: number;
  title: string;
  targetDurationSeconds: number;
  tone: "informative" | "dramatic" | "energetic" | "casual" | "analytical";
  hook: string;
  sections: ScriptSectionDto[];
  wordCount: number;
  estimatedDurationSeconds: number;
  fullText: string;
  createdAt: string;
  updatedAt: string;
}

/** Immutable script revision snapshot */
export interface ScriptVersionDto {
  id: string;
  scriptId: string;
  contentId: string;
  workspaceId: string;
  version: number;
  title: string;
  hook: string;
  sections: ScriptSectionDto[];
  fullText: string;
  wordCount: number;
  changeReason: string;
  promptUsed: Nullable<string>;
  provider: string;
  model: string;
  createdBy: string;
  createdAt: string;
}

/** Input contract for generating script */
export interface GenerateScriptInput {
  tone?: "informative" | "dramatic" | "energetic" | "casual" | "analytical";
  targetDurationSeconds?: number;
  customInstructions?: string;
}

/** Input contract for updating script */
export interface UpdateScriptInput {
  title?: string;
  tone?: "informative" | "dramatic" | "energetic" | "casual" | "analytical";
  hook?: string;
  sections: Array<{
    id?: string;
    order: number;
    type: ScriptSectionType;
    heading: string;
    narration: string;
    visualCue: string;
    estimatedDurationSeconds?: number;
  }>;
  changeReason?: string;
}
