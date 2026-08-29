import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Types } from "mongoose";
import { AutomationService } from "./automation.service";
import { AutomationRule } from "../../database/schemas/automation-rule.schema";
import { AutomationRun } from "../../database/schemas/automation-run.schema";

const mockWsId = new Types.ObjectId().toString();
const mockUserId = new Types.ObjectId().toString();
const mockRuleId = new Types.ObjectId().toString();

const mockRuleModel = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  findOneAndUpdate: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  create: jest.fn(),
  updateOne: jest.fn().mockResolvedValue({}),
  deleteOne: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(0),
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockRunModel = {
  find: jest.fn().mockReturnThis(),
  create: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

describe("AutomationService", () => {
  let service: AutomationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        {
          provide: getModelToken(AutomationRule.name),
          useValue: mockRuleModel,
        },
        {
          provide: getModelToken(AutomationRun.name),
          useValue: mockRunModel,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(""), getOrThrow: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllRules", () => {
    it("should return empty array when no rules exist", async () => {
      mockRuleModel.exec.mockResolvedValueOnce([]);
      const result = await service.findAllRules(mockWsId);
      expect(result).toEqual([]);
    });

    it("should return mapped rules", async () => {
      const mockRule = {
        _id: { toString: () => mockRuleId },
        workspaceId: { toString: () => mockWsId },
        name: "Daily YouTube",
        isEnabled: true,
        trigger: "cron",
        cronExpression: "0 9 * * *",
        platforms: ["youtube"],
        dailyTarget: 1,
        approvalMode: "full-auto",
        lastRunAt: null,
        nextRunAt: null,
        createdBy: { toString: () => mockUserId },
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      };
      mockRuleModel.exec.mockResolvedValueOnce([mockRule]);
      const result = await service.findAllRules(mockWsId);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("Daily YouTube");
      expect(result[0]!.trigger).toBe("cron");
    });
  });

  describe("createRule", () => {
    it("should create a cron rule", async () => {
      const mockCreatedRule = {
        _id: { toString: () => mockRuleId },
        workspaceId: { toString: () => mockWsId },
        name: "Test Rule",
        isEnabled: true,
        trigger: "cron",
        cronExpression: "0 9 * * *",
        platforms: ["youtube"],
        dailyTarget: 1,
        approvalMode: "full-auto",
        lastRunAt: null,
        nextRunAt: null,
        createdBy: { toString: () => mockUserId },
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: () => ({
          _id: { toString: () => mockRuleId },
          workspaceId: { toString: () => mockWsId },
          name: "Test Rule",
          isEnabled: true,
          trigger: "cron",
          cronExpression: "0 9 * * *",
          platforms: ["youtube"],
          dailyTarget: 1,
          approvalMode: "full-auto",
          lastRunAt: null,
          nextRunAt: null,
          createdBy: { toString: () => mockUserId },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };
      mockRuleModel.create.mockResolvedValueOnce(mockCreatedRule);

      const result = await service.createRule(mockWsId, mockUserId, {
        name: "Test Rule",
        trigger: "cron",
        cronExpression: "0 9 * * *",
        platforms: ["youtube"],
        dailyTarget: 1,
        approvalMode: "full-auto",
      });

      expect(result.name).toBe("Test Rule");
      expect(result.trigger).toBe("cron");
    });

    it("should throw BadRequestException if cron trigger has no cronExpression", async () => {
      await expect(
        service.createRule(mockWsId, mockUserId, {
          name: "Bad Rule",
          trigger: "cron",
          cronExpression: null,
          platforms: ["youtube"],
          dailyTarget: 1,
          approvalMode: "full-auto",
        }),
      ).rejects.toThrow("cronExpression is required for cron trigger");
    });
  });

  describe("deleteRule", () => {
    it("should throw NotFoundException if rule not found", async () => {
      const nonExistentId = new Types.ObjectId().toString();
      mockRuleModel.exec.mockResolvedValueOnce({ deletedCount: 0 });
      await expect(
        service.deleteRule(mockWsId, nonExistentId),
      ).rejects.toThrow(`Automation rule ${nonExistentId} not found`);
    });

    it("should resolve successfully when rule is deleted", async () => {
      mockRuleModel.exec.mockResolvedValueOnce({ deletedCount: 1 });
      await expect(
        service.deleteRule(mockWsId, mockRuleId),
      ).resolves.toBeUndefined();
    });
  });

  describe("getStatus", () => {
    it("should return automation status summary", async () => {
      mockRuleModel.countDocuments
        .mockResolvedValueOnce(3)  // totalRules
        .mockResolvedValueOnce(2); // enabledRules
      mockRunModel.exec.mockResolvedValueOnce([]); // recent runs

      const status = await service.getStatus(mockWsId);
      expect(status.totalRules).toBe(3);
      expect(status.enabledRules).toBe(2);
      expect(status.successfulRunsToday).toBe(0);
      expect(status.queuedJobs).toBe(0);
    });
  });
});
