import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Script, ScriptSchema } from "../../database/schemas/script.schema";
import { ScriptVersion, ScriptVersionSchema } from "../../database/schemas/script-version.schema";
import { Content, ContentSchema } from "../../database/schemas/content.schema";
import { Research, ResearchSchema } from "../../database/schemas/research.schema";
import { ResearchFact, ResearchFactSchema } from "../../database/schemas/research-fact.schema";
import { ScriptService } from "./script.service";
import { ScriptController } from "./script.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Script.name, schema: ScriptSchema },
      { name: ScriptVersion.name, schema: ScriptVersionSchema },
      { name: Content.name, schema: ContentSchema },
      { name: Research.name, schema: ResearchSchema },
      { name: ResearchFact.name, schema: ResearchFactSchema },
    ]),
  ],
  controllers: [ScriptController],
  providers: [ScriptService],
  exports: [ScriptService],
})
export class ScriptModule {}
