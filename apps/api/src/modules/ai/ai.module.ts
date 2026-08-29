import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiService } from "./ai.service";
import { GeminiTextProvider } from "./providers/gemini-text.provider";
import { MockImageProvider } from "./providers/mock-image.provider";
import { MockVoiceProvider } from "./providers/mock-voice.provider";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AiService, GeminiTextProvider, MockImageProvider, MockVoiceProvider],
  exports: [AiService],
})
export class AiModule {}
