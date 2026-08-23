import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";
import type { HydratedDocument } from "mongoose";

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({
  collection: "refresh-tokens",
  timestamps: true,
})
export class RefreshToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true, index: true })
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt?: Date;

  @Prop({ default: null })
  replacedByTokenHash?: string;

  @Prop({ default: null })
  userAgent?: string;

  @Prop({ default: null })
  ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Auto-delete expired refresh tokens from MongoDB
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
