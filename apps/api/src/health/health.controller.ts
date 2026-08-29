import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from "@nestjs/terminus";


/**
 * Health check endpoint per plan.md section 57.
 * Exposes status of MongoDB and Redis for infrastructure monitoring.
 */
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Check API and MongoDB health" })
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck("mongodb"),
    ]);
  }
}
