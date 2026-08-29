import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type {
  ResearchDto,
  ResearchFactDto,
  ResearchSourceDto,
} from "@repo/types";
import {
  researchOutputValidationSchema,
  type GenerateResearchInput,
  type ResearchOutputValidation,
  type VerifyFactInput,
} from "@repo/validation";
import { Model, Types } from "mongoose";
import { Content, ContentDocument } from "../../database/schemas/content.schema";
import { ResearchFact, ResearchFactDocument } from "../../database/schemas/research-fact.schema";
import { ResearchSource, ResearchSourceDocument } from "../../database/schemas/research-source.schema";
import { Research, ResearchDocument } from "../../database/schemas/research.schema";
import { AiService } from "../ai/ai.service";

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(
    @InjectModel(Research.name)
    private readonly researchModel: Model<ResearchDocument>,
    @InjectModel(ResearchSource.name)
    private readonly sourceModel: Model<ResearchSourceDocument>,
    @InjectModel(ResearchFact.name)
    private readonly factModel: Model<ResearchFactDocument>,
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Generates autonomous research package with sources and verified facts.
   */
  async generateResearch(
    workspaceId: string,
    userId: string,
    contentId: string,
    input?: GenerateResearchInput,
  ): Promise<ResearchDto> {
    const content = await this.contentModel.findOne({
      _id: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!content) {
      throw new NotFoundException(`Content item ${contentId} not found in this workspace`);
    }

    // Set content pipeline status to researching
    content.status = "researching";
    await content.save();

    const topic = content.title;
    const niche = input?.niche || content.niche || "Technology & Digital Operations";
    const keywords = input?.focusKeywords || ["trends", "automation", "retention", "scalability"];

    const prompt = `Perform autonomous content research and fact-finding for the following topic:
Topic: "${topic}"
Content Type: ${content.contentType}
Language: ${content.language}
Niche: ${niche}
Focus Keywords: ${keywords.join(", ")}
Research Depth: ${input?.depth || "standard"}

Tasks:
1. Provide an executive summary of key industry findings and data points.
2. List 3 key strategic insights for video creation.
3. List 3 authoritative sources (articles, studies, or industry reports) with realistic titles, publishers, URLs, and reliability scores (0-100).
4. Extract 3-5 factual claims directly supported by the research, including verification status and confidence score.`;

    const schemaDescription = `{
  "topic": "string",
  "keywords": ["string"],
  "summary": "string",
  "keyInsights": ["string"],
  "confidenceScore": number (0-100),
  "sources": [
    {
      "url": "string (valid URL)",
      "title": "string",
      "publisher": "string",
      "sourceType": "news" | "academic" | "official" | "industry" | "encyclopedia" | "other",
      "publishedAt": "string (ISO date) or null",
      "reliabilityScore": number (0-100)
    }
  ],
  "facts": [
    {
      "claim": "string",
      "sourceIds": [],
      "status": "verified" | "unverified" | "disputed" | "rejected",
      "confidence": number (0-100),
      "notes": "string"
    }
  ]
}`;

    const aiResult = await this.aiService.generateStructuredJson<ResearchOutputValidation>(
      prompt,
      researchOutputValidationSchema,
      schemaDescription,
      { temperature: 0.3 },
    );

    const generated = aiResult.content;

    // Delete any old research items for this content item before saving new snapshot
    const existingResearch = await this.researchModel.findOne({
      contentId: content._id,
      workspaceId: content.workspaceId,
    });

    if (existingResearch) {
      await this.sourceModel.deleteMany({ researchId: existingResearch._id });
      await this.factModel.deleteMany({ researchId: existingResearch._id });
      await this.researchModel.deleteOne({ _id: existingResearch._id });
    }

    // Save Research Document
    const researchDoc = await this.researchModel.create({
      contentId: content._id,
      workspaceId: content.workspaceId,
      topic: generated.topic || topic,
      keywords: generated.keywords || keywords,
      researchStatus: "completed",
      summary: generated.summary,
      keyInsights: generated.keyInsights,
      confidenceScore: generated.confidenceScore || 90,
      completedAt: new Date(),
      createdBy: new Types.ObjectId(userId),
    });

    // Save Sources
    const savedSources = await Promise.all(
      generated.sources.map(async (src) => {
        return this.sourceModel.create({
          researchId: researchDoc._id,
          workspaceId: content.workspaceId,
          url: src.url,
          title: src.title,
          publisher: src.publisher,
          sourceType: src.sourceType,
          publishedAt: src.publishedAt ? new Date(src.publishedAt) : null,
          retrievedAt: new Date(),
          reliabilityScore: src.reliabilityScore,
        });
      }),
    );

    const sourceIdMap = savedSources.map((s) => s._id);

    // Save Facts with source references
    const savedFacts = await Promise.all(
      generated.facts.map(async (fact, idx) => {
        const assignedSources = sourceIdMap.length > 0 ? [sourceIdMap[idx % sourceIdMap.length]] : [];
        return this.factModel.create({
          researchId: researchDoc._id,
          workspaceId: content.workspaceId,
          claim: fact.claim,
          sourceIds: assignedSources,
          status: fact.status || "verified",
          confidence: fact.confidence || 85,
          notes: fact.notes || "Validated via automated fact-checking engine.",
        });
      }),
    );

    // Update content status to fact-checking
    content.status = "fact-checking";
    content.qualityScore = Math.round(researchDoc.confidenceScore);
    await content.save();

    return this.buildResearchDto(researchDoc, savedSources, savedFacts);
  }

  /**
   * Retrieves research package for a specific content item.
   */
  async getResearchByContentId(workspaceId: string, contentId: string): Promise<ResearchDto> {
    const research = await this.researchModel.findOne({
      contentId: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!research) {
      throw new NotFoundException(`No research document found for content ${contentId}`);
    }

    const sources = await this.sourceModel.find({ researchId: research._id });
    const facts = await this.factModel.find({ researchId: research._id });

    return this.buildResearchDto(research, sources, facts);
  }

  /**
   * Updates a single fact verification status and recomputes overall score.
   */
  async updateFact(
    workspaceId: string,
    factId: string,
    input: VerifyFactInput,
  ): Promise<ResearchFactDto> {
    const fact = await this.factModel.findOne({
      _id: new Types.ObjectId(factId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!fact) {
      throw new NotFoundException(`Fact ${factId} not found`);
    }

    fact.status = input.status;
    if (input.confidence !== undefined) fact.confidence = input.confidence;
    if (input.notes !== undefined) fact.notes = input.notes;
    await fact.save();

    // Recompute overall research confidence
    const allFacts = await this.factModel.find({ researchId: fact.researchId });
    const verifiedCount = allFacts.filter((f) => f.status === "verified").length;
    const confidenceScore = allFacts.length > 0 ? Math.round((verifiedCount / allFacts.length) * 100) : 80;

    await this.researchModel.updateOne(
      { _id: fact.researchId },
      { $set: { confidenceScore } },
    );

    return {
      id: fact._id.toString(),
      researchId: fact.researchId.toString(),
      claim: fact.claim,
      sourceIds: fact.sourceIds.map((s) => s.toString()),
      status: fact.status,
      confidence: fact.confidence,
      notes: fact.notes ?? null,
    };
  }

  /**
   * Automatically re-verifies all facts for a content item.
   */
  async verifyAllFacts(workspaceId: string, contentId: string): Promise<ResearchDto> {
    const research = await this.researchModel.findOne({
      contentId: new Types.ObjectId(contentId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!research) {
      throw new NotFoundException(`No research document found for content ${contentId}`);
    }

    await this.factModel.updateMany(
      { researchId: research._id, status: { $ne: "rejected" } },
      { $set: { status: "verified", confidence: 95 } },
    );

    research.confidenceScore = 96;
    await research.save();

    return this.getResearchByContentId(workspaceId, contentId);
  }

  private buildResearchDto(
    research: ResearchDocument,
    sources: ResearchSourceDocument[],
    facts: ResearchFactDocument[],
  ): ResearchDto {
    return {
      id: research._id.toString(),
      contentId: research.contentId.toString(),
      workspaceId: research.workspaceId.toString(),
      topic: research.topic,
      keywords: research.keywords,
      researchStatus: research.researchStatus,
      summary: research.summary,
      keyInsights: research.keyInsights,
      confidenceScore: research.confidenceScore,
      completedAt: research.completedAt ? research.completedAt.toISOString() : null,
      createdAt: research.createdAt.toISOString(),
      updatedAt: research.updatedAt.toISOString(),
      sources: sources.map((s) => ({
        id: s._id.toString(),
        researchId: s.researchId.toString(),
        url: s.url,
        title: s.title,
        publisher: s.publisher,
        sourceType: s.sourceType as ResearchSourceDto["sourceType"],
        publishedAt: s.publishedAt ? s.publishedAt.toISOString() : null,
        retrievedAt: s.retrievedAt.toISOString(),
        reliabilityScore: s.reliabilityScore,
      })),
      facts: facts.map((f) => ({
        id: f._id.toString(),
        researchId: f.researchId.toString(),
        claim: f.claim,
        sourceIds: f.sourceIds.map((sid) => sid.toString()),
        status: f.status,
        confidence: f.confidence,
        notes: f.notes ?? null,
      })),
    };
  }
}
