import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import Redis from "ioredis";

/**
 * Custom Redis health indicator for Terminus.
 * Checks Redis connectivity by sending a PING command.
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.getClient();
      const result = await client.ping();

      if (result === "PONG") {
        return this.getStatus(key, true);
      }

      throw new Error("Redis PING returned unexpected response");
    } catch (error) {
      throw new HealthCheckError(
        "Redis health check failed",
        this.getStatus(key, false, { error: String(error) }),
      );
    }
  }

  private getClient(): Redis {
    if (!this.client) {
      const redisUrl = this.configService.getOrThrow<string>("REDIS_URL");
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
      });
    }
    return this.client;
  }
}
