import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Content, ContentSchema } from "../../database/schemas/content.schema";
import { ResearchFact, ResearchFactSchema } from "../../database/schemas/research-fact.schema";
import { ResearchSource, ResearchSourceSchema } from "../../database/schemas/research-source.schema";
import { Research, ResearchSchema } from "../../database/schemas/research.schema";
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from "../../database/schemas/workspace-member.schema";
import { ResearchController } from "./research.controller";
import { ResearchService } from "./research.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Research.name, schema: ResearchSchema },
      { name: ResearchSource.name, schema: ResearchSourceSchema },
      { name: ResearchFact.name, schema: ResearchFactSchema },
      { name: Content.name, schema: ContentSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
  exports: [ResearchService],
})
export class ResearchModule {}

