import { z } from "zod";

const platformTypeEnum = z.enum(["youtube", "facebook"]);

export const connectPlatformSchema = z.object({
  platform: platformTypeEnum,
  authorizationCode: z.string().min(1),
  redirectUri: z.string().url(),
});

export type ConnectPlatformInput = z.infer<typeof connectPlatformSchema>;
