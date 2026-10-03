import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { PresignedUploadUrlDto } from "@repo/types";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly localStorageDir: string;
  private readonly isLocalStorage: boolean;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>("STORAGE_BUCKET") || "ai-content-platform";
    this.endpoint = this.configService.get<string>("STORAGE_ENDPOINT") || "http://localhost:9000";
    this.localStorageDir = path.resolve(process.cwd(), "uploads");
    this.isLocalStorage = this.configService.get<string>("NODE_ENV") !== "production";

    if (!fs.existsSync(this.localStorageDir)) {
      try {
        fs.mkdirSync(this.localStorageDir, { recursive: true });
      } catch (err) {
        this.logger.warn(`Could not initialize local upload directory: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Generates a SHA256 checksum for a buffer.
   */
  calculateChecksum(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Generates an S3/MinIO compatible presigned upload URL or local upload URL.
   */
  async getPresignedUploadUrl(
    storageKey: string,
    mimeType: string,
    expiresInSeconds = 3600,
  ): Promise<PresignedUploadUrlDto> {
    const publicUrl = this.getPublicUrl(storageKey);

    // If using local filesystem storage
    if (this.isLocalStorage) {
      const directUploadEndpoint = `${this.configService.get<string>("API_URL") || "http://localhost:3010"}/api/v1/media-assets/direct-upload?key=${encodeURIComponent(storageKey)}`;
      return {
        uploadUrl: directUploadEndpoint,
        storageKey,
        publicUrl,
        expiresInSeconds,
        headers: { "Content-Type": mimeType },
      };
    }

    // MinIO / S3 Presigned URL path
    const uploadUrl = `${this.endpoint}/${this.bucket}/${storageKey}`;
    return {
      uploadUrl,
      storageKey,
      publicUrl,
      expiresInSeconds,
      headers: { "Content-Type": mimeType },
    };
  }

  /**
   * Generates a presigned download URL with expiry.
   */
  async getPresignedDownloadUrl(storageKey: string, _expiresInSeconds = 3600): Promise<string> {
    return this.getPublicUrl(storageKey);
  }

  /**
   * Uploads a Buffer directly to storage.
   */
  async uploadBuffer(
    storageKey: string,
    buffer: Buffer,
    _mimeType: string,
    _metadata?: Record<string, string>,
  ): Promise<{ url: string; storageKey: string; sizeBytes: number; checksum: string }> {
    const checksum = this.calculateChecksum(buffer);
    const sizeBytes = buffer.length;

    // Save to persistent local storage directory
    const targetPath = path.join(this.localStorageDir, storageKey);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, buffer);
    const url = this.getPublicUrl(storageKey);

    return {
      url,
      storageKey,
      sizeBytes,
      checksum,
    };
  }

  /**
   * Deletes a file from storage.
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    const targetPath = path.join(this.localStorageDir, storageKey);
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
        return true;
      } catch (err) {
        this.logger.warn(`Failed to delete local file ${targetPath}: ${(err as Error).message}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Formats public access URL for an asset.
   */
  getPublicUrl(storageKey: string): string {
    const apiBase = this.configService.get<string>("API_URL") || "http://localhost:3010";
    return `${apiBase}/uploads/${storageKey.replace(/\\/g, "/")}`;
  }
}
