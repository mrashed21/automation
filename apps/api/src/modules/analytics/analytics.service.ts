import {
  Injectable,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  AnalyticsSnapshot,
  AnalyticsSnapshotDocument,
} from "../../database/schemas/analytics-snapshot.schema";
import {
  Publication,
  PublicationDocument,
} from "../../database/schemas/publication.schema";
import {
  SocialAccount,
  SocialAccountDocument,
} from "../../database/schemas/social-account.schema";
import {
  Content,
  ContentDocument,
} from "../../database/schemas/content.schema";
import type { AnalyticsSnapshotDto } from "@repo/types";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(AnalyticsSnapshot.name)
    private readonly snapshotModel: Model<AnalyticsSnapshotDocument>,
    @InjectModel(Publication.name)
    private readonly publicationModel: Model<PublicationDocument>,
    @InjectModel(SocialAccount.name)
    private readonly socialAccountModel: Model<SocialAccountDocument>,
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
  ) {}

  // ─── Sync Analytics for a Content Item ───────────────────────────────────

  async syncForContent(
    contentId: string,
    workspaceId: string,
  ): Promise<AnalyticsSnapshotDto[]> {
    const cid = new Types.ObjectId(contentId);
    const wid = new Types.ObjectId(workspaceId);

    // Find all published publications for this content
    const publications = await this.publicationModel
      .find({
        contentId: cid,
        workspaceId: wid,
        status: "published",
        externalPostId: { $ne: null },
      })
      .lean()
      .exec();

    if (publications.length === 0) {
      this.logger.log(
        `No published publications found for content=${contentId}`,
      );
      return [];
    }

    const snapshots: AnalyticsSnapshotDto[] = [];

    for (const pub of publications) {
      // Fetch the connected social account for this publication
      const account = await this.socialAccountModel
        .findById(pub.socialAccountId)
        .lean()
        .exec();

      if (!account) continue;

      let metrics: Partial<AnalyticsSnapshotDto> = {};

      try {
        if (pub.platform === "youtube") {
          metrics = await this.fetchYouTubeMetrics(
            pub.externalPostId!,
            account.accessToken,
          );
        } else if (pub.platform === "facebook") {
          metrics = await this.fetchFacebookMetrics(
            pub.externalPostId!,
            account.accessToken,
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to fetch ${pub.platform} metrics for video=${pub.externalPostId}: ${String(err)}`,
        );
        // Create a zero-metric snapshot so the record exists
        metrics = { views: 0, likes: 0, comments: 0, shares: 0 };
      }

      const snapshot = await this.snapshotModel.create({
        contentId: cid,
        publicationId: pub._id,
        workspaceId: wid,
        platform: pub.platform,
        capturedAt: new Date(),
        views: metrics.views ?? 0,
        likes: metrics.likes ?? 0,
        comments: metrics.comments ?? 0,
        shares: metrics.shares ?? 0,
        watchTimeSeconds: metrics.watchTimeSeconds ?? null,
        averageViewDurationSeconds: metrics.averageViewDurationSeconds ?? null,
        retentionPercent: metrics.retentionPercent ?? null,
        clickThroughRate: metrics.clickThroughRate ?? null,
        subscribersGained: metrics.subscribersGained ?? null,
        followersGained: metrics.followersGained ?? null,
      });

      snapshots.push(this.mapSnapshot(snapshot.toObject() as unknown as Record<string, unknown>));
    }

    this.logger.log(
      `Synced ${snapshots.length} analytics snapshots for content=${contentId}`,
    );

    return snapshots;
  }

  // ─── Get Snapshots (time-series) ──────────────────────────────────────────

  async getSnapshots(
    contentId: string,
    workspaceId: string,
  ): Promise<AnalyticsSnapshotDto[]> {
    const snapshots = await this.snapshotModel
      .find({
        contentId: new Types.ObjectId(contentId),
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .sort({ capturedAt: 1 })
      .lean()
      .exec();

    return snapshots.map((s) => this.mapSnapshot(s));
  }

  // ─── Get Latest Metrics Per Platform ─────────────────────────────────────

  async getLatest(
    contentId: string,
    workspaceId: string,
  ): Promise<AnalyticsSnapshotDto[]> {
    const cid = new Types.ObjectId(contentId);
    const wid = new Types.ObjectId(workspaceId);

    // Get most recent snapshot per platform via aggregation
    const result = await this.snapshotModel.aggregate<
      Record<string, unknown>
    >([
      { $match: { contentId: cid, workspaceId: wid } },
      { $sort: { capturedAt: -1 } },
      {
        $group: {
          _id: "$platform",
          doc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);

    return result.map((s) => this.mapSnapshot(s));
  }

  // ─── Workspace-Level Summary ──────────────────────────────────────────────

  async getWorkspaceSummary(workspaceId: string): Promise<{
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalWatchTimeHours: number;
    publishedContentCount: number;
  }> {
    const wid = new Types.ObjectId(workspaceId);

    const [aggregate, publishedCount] = await Promise.all([
      this.snapshotModel.aggregate<{
        totalViews: number;
        totalLikes: number;
        totalComments: number;
        totalWatchTime: number;
      }>([
        { $match: { workspaceId: wid } },
        {
          $group: {
            _id: "$contentId",
            latestViews: { $max: "$views" },
            latestLikes: { $max: "$likes" },
            latestComments: { $max: "$comments" },
            latestWatchTime: { $max: "$watchTimeSeconds" },
          },
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$latestViews" },
            totalLikes: { $sum: "$latestLikes" },
            totalComments: { $sum: "$latestComments" },
            totalWatchTime: { $sum: "$latestWatchTime" },
          },
        },
      ]),
      this.contentModel.countDocuments({
        workspaceId: wid,
        status: "published",
      }),
    ]);

    const totals = aggregate[0];
    return {
      totalViews: totals?.totalViews ?? 0,
      totalLikes: totals?.totalLikes ?? 0,
      totalComments: totals?.totalComments ?? 0,
      totalWatchTimeHours: Math.round(
        ((totals?.totalWatchTime ?? 0) / 3600) * 10,
      ) / 10,
      publishedContentCount: publishedCount,
    };
  }

  // ─── Platform API Adapters ────────────────────────────────────────────────

  private async fetchYouTubeMetrics(
    videoId: string,
    accessToken: string,
  ): Promise<Partial<AnalyticsSnapshotDto>> {
    // YouTube Data API v3 — videos.list (statistics) + YouTube Analytics API
    // In production: fetch from https://www.googleapis.com/youtube/v3/videos
    // with parts=statistics&id=${videoId} and Authorization header
    this.logger.debug(`Fetching YouTube metrics for videoId=${videoId}`);

    // Simulated response for now (real tokens needed at runtime)
    const mockStats = {
      views: Math.floor(Math.random() * 50000) + 1000,
      likes: Math.floor(Math.random() * 2000) + 50,
      comments: Math.floor(Math.random() * 500) + 10,
      shares: Math.floor(Math.random() * 300) + 5,
      watchTimeSeconds: Math.floor(Math.random() * 200000) + 10000,
      averageViewDurationSeconds: Math.floor(Math.random() * 420) + 60,
      retentionPercent: Math.round((Math.random() * 40 + 30) * 10) / 10,
      clickThroughRate: Math.round((Math.random() * 8 + 2) * 10) / 10,
      subscribersGained: Math.floor(Math.random() * 200) + 5,
    };

    void accessToken; // used in production requests
    return mockStats;
  }

  private async fetchFacebookMetrics(
    videoId: string,
    accessToken: string,
  ): Promise<Partial<AnalyticsSnapshotDto>> {
    // Meta Graph API — /{video-id}/video_insights
    this.logger.debug(`Fetching Facebook metrics for videoId=${videoId}`);

    const mockStats = {
      views: Math.floor(Math.random() * 20000) + 500,
      likes: Math.floor(Math.random() * 1000) + 20,
      comments: Math.floor(Math.random() * 200) + 5,
      shares: Math.floor(Math.random() * 150) + 3,
      watchTimeSeconds: Math.floor(Math.random() * 80000) + 5000,
      averageViewDurationSeconds: Math.floor(Math.random() * 300) + 30,
      retentionPercent: Math.round((Math.random() * 35 + 20) * 10) / 10,
      followersGained: Math.floor(Math.random() * 50) + 2,
    };

    void accessToken; // used in production requests
    return mockStats;
  }

  // ─── Mapper ───────────────────────────────────────────────────────────────

  private mapSnapshot(s: Record<string, unknown>): AnalyticsSnapshotDto {
    return {
      id: (s._id as Types.ObjectId).toString(),
      contentId: (s.contentId as Types.ObjectId).toString(),
      platform: s.platform as AnalyticsSnapshotDto["platform"],
      capturedAt: (s.capturedAt as Date).toISOString(),
      views: (s.views as number) ?? 0,
      likes: (s.likes as number) ?? 0,
      comments: (s.comments as number) ?? 0,
      shares: (s.shares as number) ?? 0,
      watchTimeSeconds: (s.watchTimeSeconds as number | null) ?? null,
      averageViewDurationSeconds:
        (s.averageViewDurationSeconds as number | null) ?? null,
      retentionPercent: (s.retentionPercent as number | null) ?? null,
      clickThroughRate: (s.clickThroughRate as number | null) ?? null,
      subscribersGained: (s.subscribersGained as number | null) ?? null,
      followersGained: (s.followersGained as number | null) ?? null,
    };
  }
}
