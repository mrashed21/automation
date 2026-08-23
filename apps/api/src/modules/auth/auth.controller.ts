import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { WorkspacesService } from "../workspaces/workspaces.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { LoginInput, RegisterInput } from "@repo/validation";
import type { AuthenticatedUser, AuthResponseDto } from "@repo/types";

const REFRESH_COOKIE_NAME = "acp_refresh_token";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user and create default workspace" })
  async register(
    @Body() input: RegisterInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { authResponse, rawRefreshToken } = await this.authService.register(
      input,
      userAgent,
      ipAddress,
    );

    this.setRefreshTokenCookie(res, rawRefreshToken);
    return authResponse;
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate with email and password" })
  async login(
    @Body() input: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(input.email, input.password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { authResponse, rawRefreshToken } = await this.authService.login(
      user,
      userAgent,
      ipAddress,
    );

    this.setRefreshTokenCookie(res, rawRefreshToken);
    return authResponse;
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rotate refresh token and issue new access token" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) {
      throw new UnauthorizedException("Refresh token cookie missing");
    }

    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { accessToken, expiresIn, newRawRefreshToken } =
      await this.authService.refreshTokens(rawRefreshToken, userAgent, ipAddress);

    this.setRefreshTokenCookie(res, newRawRefreshToken);
    return { accessToken, expiresIn };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out user and revoke refresh token" })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(rawRefreshToken);

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
    });

    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current session user and active workspace" })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    const isProduction = process.env["NODE_ENV"] === "production";
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge,
      path: "/api/v1/auth",
    });
  }
}
