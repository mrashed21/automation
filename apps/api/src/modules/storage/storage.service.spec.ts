import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "STORAGE_BUCKET") return "test-bucket";
              if (key === "STORAGE_ENDPOINT") return "http://localhost:9000";
              if (key === "API_URL") return "http://localhost:3010";
              if (key === "NODE_ENV") return "test";
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should calculate correct sha256 checksum for buffers", () => {
    const buf = Buffer.from("hello world");
    const checksum = service.calculateChecksum(buf);
    expect(checksum).toBe("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
  });

  it("should generate upload URL and return public access URL", async () => {
    const result = await service.getPresignedUploadUrl("test/sample.mp4", "video/mp4");
    expect(result.storageKey).toBe("test/sample.mp4");
    expect(result.uploadUrl).toBeDefined();
    expect(result.publicUrl).toContain("/uploads/test/sample.mp4");
  });

  it("should upload buffer and return metadata", async () => {
    const buf = Buffer.from("test media content");
    const key = "test/subfolder/file.txt";
    const res = await service.uploadBuffer(key, buf, "text/plain");

    expect(res.storageKey).toBe(key);
    expect(res.sizeBytes).toBe(buf.length);
    expect(res.checksum).toBe(service.calculateChecksum(buf));
    expect(res.url).toContain("/uploads/test/subfolder/file.txt");

    // Clean up test file
    await service.deleteFile(key);
  });
});
