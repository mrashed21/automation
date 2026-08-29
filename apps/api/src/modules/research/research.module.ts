import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Research, ResearchSchema } from "../../database/schemas/research.schema";
import { ResearchSource, ResearchSourceSchema } from "../../database/schemas/research-source.schema";
import { ResearchFact, ResearchFactSchema } from "../../database/schemas/research-fact.schema";
import { Content, ContentSchema } from "../../database/schemas/content.schema";
import { ResearchService } from "./research.service";
import { ResearchController } from "./research.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Research.name, schema: ResearchSchema },
      { name: ResearchSource.name, schema: ResearchSourceSchema },
      { name: ResearchFact.name, schema: ResearchFactSchema },
      { name: Content.name, schema: ContentSchema },
    ]),
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
  exports: [ResearchService],
})
export class ResearchModule {}
