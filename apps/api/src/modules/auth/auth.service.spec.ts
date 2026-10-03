import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import type { Model } from "mongoose";
import { Types } from "mongoose";
import { RefreshToken, RefreshTokenDocument } from "../../database/schemas/refresh-token.schema";
import type { UserDocument } from "../../database/schemas/user.schema";
import type { WorkspaceDocument } from "../../database/schemas/workspace.schema";
import { UsersService } from "../users/users.service";
import { WorkspacesService } from "../workspaces/workspaces.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    toDto: jest.fn((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      createdAt: new Date().toISOString(),
    })),
  };

  const mockWorkspacesService = {
    createWorkspace: jest.fn(),
    getUserWorkspaces: jest.fn(),
    toDto: jest.fn((w) => ({
      id: w._id.toString(),
      name: w.name,
      slug: w.slug,
      language: "en",
      dailyContentTarget: 1,
    })),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("signed-jwt-token"),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("15m"),
    getOrThrow: jest.fn().mockReturnValue("test-secret"),
  };

  const mockRefreshTokenModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  })) as unknown as Model<RefreshTokenDocument> & {
    findOne: jest.Mock;
    deleteOne: jest.Mock;
    deleteMany: jest.Mock;
  };
  mockRefreshTokenModel.findOne = jest.fn();
  mockRefreshTokenModel.deleteOne = jest.fn();
  mockRefreshTokenModel.deleteMany = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: WorkspacesService, useValue: mockWorkspacesService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken(RefreshToken.name), useValue: mockRefreshTokenModel },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should register a user and create default workspace", async () => {
    const validUserId = new Types.ObjectId();
    const validWorkspaceId = new Types.ObjectId();

    const mockUser = {
      _id: validUserId,
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed",
    } as unknown as UserDocument;

    const mockWorkspace = {
      _id: validWorkspaceId,
      name: "Test User's Workspace",
      slug: "test-users-workspace",
    } as unknown as WorkspaceDocument;

    mockUsersService.create.mockResolvedValue(mockUser);
    mockWorkspacesService.createWorkspace.mockResolvedValue(mockWorkspace);

    const result = await service.register({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(result.authResponse.accessToken).toBe("signed-jwt-token");
    expect(result.authResponse.user.email).toBe("test@example.com");
    expect(result.rawRefreshToken).toBeDefined();
    expect(mockWorkspacesService.createWorkspace).toHaveBeenCalled();
  });
});
