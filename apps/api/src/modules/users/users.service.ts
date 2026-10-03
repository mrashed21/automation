import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { UserDto } from "@repo/types";
import type { RegisterInput } from "@repo/validation";
import * as bcrypt from "bcryptjs";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "../../database/schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(input: RegisterInput): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictException("An account with this email address already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = new this.userModel({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      isEmailVerified: false,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("User not found");
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  toDto(user: UserDocument): UserDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
