import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type {
  ScriptDto,
  ScriptVersionDto,
} from "@repo/types";
import {
  scriptOutputValidationSchema,
  type GenerateScriptInput,
  type ScriptOutputValidation,
  type UpdateScriptInput,
} from "@repo/validation";
import { Model, Types } from "mongoose";
import { Content, ContentDocument } from "../../database/schemas/content.schema";
import { ResearchFact, ResearchFactDocument } from "../../database/schemas/research-fact.schema";
import { Research, ResearchDocument } from "../../database/schemas/research.schema";
import { ScriptVersion, ScriptVersionDocument } from "../../database/schemas/script-version.schema";
import { Script, ScriptDocument } from "../../database/schemas/script.schema";
import { AiService } from "../ai/ai.service";

@Injectable()
export class ScriptService {
  private readonly logger = new Logger(ScriptService.name);

  constructor(
    @InjectModel(Script.name)
    private readonly scriptModel: Model<ScriptDocument>,
    @InjectModel(ScriptVersion.name)
    private readonly scriptVersionModel: Model<ScriptVersionDocument>,
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
    @InjectModel(Research.name)
    private readonly researchModel: Model<ResearchDocument>,
    @InjectModel(ResearchFact.name)
    private readonly factModel: Model<ResearchFactDocument>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Generates a multi-section script tailored to the content type and verified research.
   */
  async generateScript(
    workspaceId: string,
    userId: string,
    contentId: string,
    input?: GenerateScriptInput,
  ): Promise<ScriptDto> {
    const content = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!content) {
      throw new NotFoundException(`Content item ${contentId} not found in workspace`);
    }

    // Fetch verified research context if available
    let researchContext = "";
    const research = await this.researchModel.findOne({
      contentId: content._id,
      workspaceId: content.workspaceId,
    });

    if (research) {
      const verifiedFacts = await this.factModel.find({
        researchId: research._id,
        status: "verified",
      });
      researchContext = `\n\nVerified Research Summary:\n${research.summary}\n\nKey Insights:\n${research.keyInsights.join("\n- ")}\n\nVerified Facts to Include:\n${verifiedFacts.map((f) => `- ${f.claim}`).join("\n")}`;
    }

    const targetDuration = input?.targetDurationSeconds || (content.contentType.includes("short") || content.contentType.includes("reel") ? 60 : 180);
    const tone = input?.tone || "informative";

    const prompt = `Write a high-retention video script for:
Title: "${content.title}"
Format: ${content.contentType}
Language: ${content.language}
Target Duration: ${targetDuration} seconds
Tone: ${tone}
${researchContext}
${input?.customInstructions ? `Custom Instructions: ${input.customInstructions}` : ""}

Requirements:
1. Create an irresistible opening 3-second hook that halts scrolling.
2. Structure the script into clear sequential sections:
   - Hook (first 3-6s)
   - Intro (context & problem)
   - Body points (actionable deep dive / verified claims)
   - Climax / Key revelation
   - Call-to-action & Outro
3. For each section, provide the spoken narration text AND a visual cue description for the video editor.
4. Estimate spoken duration realistically (approx. 2.4 words per second).`;

    const schemaDescription = `{
  "title": "string",
  "hook": "string (compelling opening hook)",
  "targetDurationSeconds": number,
  "tone": "informative" | "dramatic" | "energetic" | "casual" | "analytical",
  "sections": [
    {
      "order": number (1, 2, 3...),
      "type": "hook" | "intro" | "body" | "climax" | "call-to-action" | "outro",
      "heading": "string",
      "narration": "string (spoken word text)",
      "visualCue": "string (visual directive for video renderer)",
      "estimatedDurationSeconds": number
    }
  ]
}`;

    const aiResult = await this.aiService.generateStructuredJson<ScriptOutputValidation>(
      prompt,
      scriptOutputValidationSchema,
      schemaDescription,
      { temperature: 0.7 },
    );

    const generated = aiResult.content;

    // Process and enrich sections with exact word counts & durations
    const processedSections = generated.sections.map((sec, idx) => {
      const words = sec.narration.trim().split(/\s+/).filter(Boolean).length;
      const calcDuration = Math.max(3, Math.round(words / 2.4));
      return {
        id: new Types.ObjectId().toString(),
        order: idx + 1,
        type: sec.type,
        heading: sec.heading,
        narration: sec.narration,
        visualCue: sec.visualCue || "",
        estimatedDurationSeconds: sec.estimatedDurationSeconds || calcDuration,
        wordCount: words,
      };
    });

    const totalWords = processedSections.reduce((acc, s) => acc + s.wordCount, 0);
    const totalDuration = processedSections.reduce((acc, s) => acc + s.estimatedDurationSeconds, 0);
    const fullText = processedSections.map((s) => `[${s.heading.toUpperCase()}]\n${s.narration}`).join("\n\n");

    let script = await this.scriptModel.findOne({
      contentId: content._id,
      workspaceId: content.workspaceId,
    });

    let versionNumber = 1;

    if (script) {
      versionNumber = script.currentVersion + 1;
      script.currentVersion = versionNumber;
      script.title = generated.title;
      script.hook = generated.hook;
      script.tone = tone;
      script.targetDurationSeconds = targetDuration;
      script.sections = processedSections;
      script.wordCount = totalWords;
      script.estimatedDurationSeconds = totalDuration;
      script.fullText = fullText;
      script.updatedBy = new Types.ObjectId(userId);
      await script.save();
    } else {
      script = await this.scriptModel.create({
        contentId: content._id,
        workspaceId: content.workspaceId,
        currentVersion: 1,
        title: generated.title,
        hook: generated.hook,
        tone,
        targetDurationSeconds: targetDuration,
        sections: processedSections,
        wordCount: totalWords,
        estimatedDurationSeconds: totalDuration,
        fullText,
        createdBy: new Types.ObjectId(userId),
      });

      content.scriptId = script._id;
    }

    // Record immutable version snapshot per plan.md section 19
    await this.scriptVersionModel.create({
      scriptId: script._id,
      contentId: content._id,
      workspaceId: content.workspaceId,
      version: versionNumber,
      title: script.title,
      hook: script.hook,
      sections: script.sections,
      fullText: script.fullText,
      wordCount: script.wordCount,
      changeReason: versionNumber === 1 ? "AI script generation" : "AI regeneration",
      promptUsed: prompt.slice(0, 500),
      provider: aiResult.provider,
      model: aiResult.model,
      createdBy: new Types.ObjectId(userId),
    });

    // Update content status
    content.status = "scripting";
    await content.save();

    return this.buildScriptDto(script);
  }

  /**
   * Retrieves current active script for a content item.
   */
  async getScriptByContentId(workspaceId: string, contentId: string): Promise<ScriptDto> {
    const script = await this.scriptModel.findOne({
      contentId: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!script) {
      throw new NotFoundException(`Script not found for content ${contentId}`);
    }

    return this.buildScriptDto(script);
  }

  /**
   * Updates script manually and records a new immutable version snapshot.
   */
  async updateScript(
    workspaceId: string,
    userId: string,
    contentId: string,
    input: UpdateScriptInput,
  ): Promise<ScriptDto> {
    const script = await this.scriptModel.findOne({
      contentId: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!script) {
      throw new NotFoundException(`Script not found for content ${contentId}`);
    }

    const processedSections = input.sections.map((sec, idx) => {
      const words = sec.narration.trim().split(/\s+/).filter(Boolean).length;
      const calcDuration = Math.max(3, Math.round(words / 2.4));
      return {
        id: sec.id || new Types.ObjectId().toString(),
        order: idx + 1,
        type: sec.type,
        heading: sec.heading,
        narration: sec.narration,
        visualCue: sec.visualCue || "",
        estimatedDurationSeconds: sec.estimatedDurationSeconds || calcDuration,
        wordCount: words,
      };
    });

    const totalWords = processedSections.reduce((acc, s) => acc + s.wordCount, 0);
    const totalDuration = processedSections.reduce((acc, s) => acc + s.estimatedDurationSeconds, 0);
    const fullText = processedSections.map((s) => `[${s.heading.toUpperCase()}]\n${s.narration}`).join("\n\n");

    const newVersion = script.currentVersion + 1;
    script.currentVersion = newVersion;
    if (input.title) script.title = input.title;
    if (input.hook) script.hook = input.hook;
    if (input.tone) script.tone = input.tone;
    script.sections = processedSections;
    script.wordCount = totalWords;
    script.estimatedDurationSeconds = totalDuration;
    script.fullText = fullText;
    script.updatedBy = new Types.ObjectId(userId);
    await script.save();

    // Record immutable revision snapshot
    await this.scriptVersionModel.create({
      scriptId: script._id,
      contentId: script.contentId,
      workspaceId: script.workspaceId,
      version: newVersion,
      title: script.title,
      hook: script.hook,
      sections: script.sections,
      fullText: script.fullText,
      wordCount: script.wordCount,
      changeReason: input.changeReason || "Manual editor update",
      promptUsed: null,
      provider: "manual",
      model: "human-editor",
      createdBy: new Types.ObjectId(userId),
    });

    return this.buildScriptDto(script);
  }

  /**
   * Retrieves all immutable revision versions for a script.
   */
  async getScriptVersions(workspaceId: string, contentId: string): Promise<ScriptVersionDto[]> {
    const versions = await this.scriptVersionModel
      .find({
        contentId: new Types.ObjectId(contentId),
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .sort({ version: -1 });

    return versions.map((v) => ({
      id: v._id.toString(),
      scriptId: v.scriptId.toString(),
      contentId: v.contentId.toString(),
      workspaceId: v.workspaceId.toString(),
      version: v.version,
      title: v.title,
      hook: v.hook,
      sections: v.sections.map((s) => ({
        id: s.id,
        order: s.order,
        type: s.type,
        heading: s.heading,
        narration: s.narration,
        visualCue: s.visualCue,
        estimatedDurationSeconds: s.estimatedDurationSeconds,
        wordCount: s.wordCount,
      })),
      fullText: v.fullText,
      wordCount: v.wordCount,
      changeReason: v.changeReason,
      promptUsed: v.promptUsed ?? null,
      provider: v.provider,
      model: v.model,
      createdBy: v.createdBy.toString(),
      createdAt: v.createdAt.toISOString(),
    }));
  }

  private buildScriptDto(script: ScriptDocument): ScriptDto {
    return {
      id: script._id.toString(),
      contentId: script.contentId.toString(),
      workspaceId: script.workspaceId.toString(),
      currentVersion: script.currentVersion,
      title: script.title,
      targetDurationSeconds: script.targetDurationSeconds,
      tone: script.tone as ScriptDto["tone"],
      hook: script.hook,
      sections: script.sections.map((s) => ({
        id: s.id,
        order: s.order,
        type: s.type,
        heading: s.heading,
        narration: s.narration,
        visualCue: s.visualCue,
        estimatedDurationSeconds: s.estimatedDurationSeconds,
        wordCount: s.wordCount,
      })),
      wordCount: script.wordCount,
      estimatedDurationSeconds: script.estimatedDurationSeconds,
      fullText: script.fullText,
      createdAt: script.createdAt.toISOString(),
      updatedAt: script.updatedAt.toISOString(),
    };
  }
}
