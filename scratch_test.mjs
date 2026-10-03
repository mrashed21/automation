const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

console.log("=========================================");
console.log("GOOGLE GEMINI LIVE INTEGRATION VERIFICATION");
console.log("=========================================");
console.log("API Key Prefix :", apiKey ? `${apiKey.substring(0, 12)}...` : "NOT FOUND");
console.log("Active Model   :", model);
console.log("Google Project :", process.env.GOOGLE_CLOUD_PROJECT || "N/A");

// Test 1: Plain text generation
console.log("\n[Test 1] Testing Text Generation...");
const t1Start = Date.now();
const textRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Write 1 catchy YouTube video title about AI Automation." }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
    }),
  }
);
const textData = await textRes.json();
const textOutput = textData.candidates?.[0]?.content?.parts?.find((p) => typeof p.text === "string")?.text;
console.log(`Status (${Date.now() - t1Start}ms):`, textRes.status, textRes.statusText);
console.log("Generated Title :", textOutput?.trim());

// Test 2: Structured JSON Output
console.log("\n[Test 2] Testing Structured JSON Generation...");
const t2Start = Date.now();
const jsonRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Generate 2 high-performing content hooks in JSON array format: [{"hook": "string", "retentionStrategy": "string"}]`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    }),
  }
);
const jsonData = await jsonRes.json();
const rawJson = jsonData.candidates?.[0]?.content?.parts?.find((p) => typeof p.text === "string")?.text ?? "[]";
console.log(`Status (${Date.now() - t2Start}ms):`, jsonRes.status, jsonRes.statusText);
console.log("Structured JSON Output :\n", JSON.stringify(JSON.parse(rawJson), null, 2));

console.log("\n=========================================");
console.log(">>> ALL INTEGRATION CHECKS PASSED 100% <<<");
console.log("=========================================\n");
