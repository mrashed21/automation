import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import {
  RefreshToken,
  RefreshTokenDocument,
} from "../../database/schemas/refresh-token.schema";
import { UserDocument } from "../../database/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { WorkspacesService } from "../workspaces/workspaces.service";
import type { RegisterInput } from "@repo/validation";
import type { AuthResponseDto, JwtPayload } from "@repo/types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private workspacesService: WorkspacesService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  async register(input: RegisterInput, userAgent?: string, ipAddress?: string): Promise<{ authResponse: AuthResponseDto; rawRefreshToken: string }> {
    // 1. Create user
    const user = await this.usersService.create(input);

    // 2. Automatically create default workspace for user
    const workspaceName = input.workspaceName || `${input.name}'s Workspace`;
    const defaultWorkspace = await this.workspacesService.createWorkspace(user._id.toString(), {
      name: workspaceName,
      language: "en",
      dailyContentTarget: 1,
    });

    // 3. Issue tokens
    const { accessToken, expiresIn } = this.generateAccessToken(user);
    const rawRefreshToken = await this.createRefreshToken(user._id.toString(), userAgent, ipAddress);

    const workspaces = [this.workspacesService.toDto(defaultWorkspace)];

    return {
      authResponse: {
        user: this.usersService.toDto(user),
        activeWorkspace: this.workspacesService.toDto(defaultWorkspace),
        workspaces,
        accessToken,
        expiresIn,
      },
      rawRefreshToken,
    };
  }

  async login(user: UserDocument, userAgent?: string, ipAddress?: string): Promise<{ authResponse: AuthResponseDto; rawRefreshToken: string }> {
    await this.usersService.updateLastLogin(user._id.toString());

    const { accessToken, expiresIn } = this.generateAccessToken(user);
    const rawRefreshToken = await this.createRefreshToken(user._id.toString(), userAgent, ipAddress);

    const workspaces = await this.workspacesService.getUserWorkspaces(user._id.toString());
    const activeWorkspace = workspaces[0];

    if (!activeWorkspace) {
      throw new UnauthorizedException("User has no accessible workspace.");
    }

    return {
      authResponse: {
        user: this.usersService.toDto(user),
        activeWorkspace,
        workspaces,
        accessToken,
        expiresIn,
      },
      rawRefreshToken,
    };
  }

  async refreshTokens(rawRefreshToken: string, userAgent?: string, ipAddress?: string): Promise<{ accessToken: string; expiresIn: number; newRawRefreshToken: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRecord = await this.refreshTokenModel.findOne({ tokenHash });

    if (!tokenRecord) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Token reuse detection: if already revoked, invalidate all tokens for user
    if (tokenRecord.revokedAt) {
      await this.refreshTokenModel.deleteMany({ userId: tokenRecord.userId });
      throw new UnauthorizedException("Compromised token detected. All sessions revoked.");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    const user = await this.usersService.findById(tokenRecord.userId.toString());

    // Rotate refresh token
    const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
    const newTokenHash = this.hashToken(newRawRefreshToken);

    // Revoke old token and reference replacement
    tokenRecord.revokedAt = new Date();
    tokenRecord.replacedByTokenHash = newTokenHash;
    await tokenRecord.save();

    // Store new token
    const expiresDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const newTokenRecord = new this.refreshTokenModel({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    });
    await newTokenRecord.save();

    const { accessToken, expiresIn } = this.generateAccessToken(user);

    return {
      accessToken,
      expiresIn,
      newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.refreshTokenModel.deleteOne({ tokenHash });
    }
  }

  async getMe(userId: string): Promise<{ user: ReturnType<UsersService["toDto"]>; workspaces: ReturnType<WorkspacesService["toDto"]>[]; activeWorkspace: ReturnType<WorkspacesService["toDto"]> }> {
    const user = await this.usersService.findById(userId);
    const workspaces = await this.workspacesService.getUserWorkspaces(userId);

    const activeWorkspace = workspaces[0];
    if (!activeWorkspace) {
      throw new UnauthorizedException("User has no accessible workspace.");
    }

    return {
      user: this.usersService.toDto(user),
      workspaces,
      activeWorkspace,
    };
  }

  generateAccessToken(user: UserDocument): { accessToken: string; expiresIn: number } {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const expiresIn = 15 * 60; // 15 minutes in seconds
    const accessToken = this.jwtService.sign(payload, { expiresIn: `${expiresIn}s` });

    return { accessToken, expiresIn };
  }

  private async createRefreshToken(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const expiresDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const refreshToken = new this.refreshTokenModel({
      userId: new Types.ObjectId(userId),
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    });

    await refreshToken.save();
    return rawToken;
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
