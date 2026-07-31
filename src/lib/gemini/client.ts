interface GenerateContentOptions {
  model: string;
  systemInstruction: string;
  userContent: string;
  responseSchema?: object;
}

export async function generateContent(opts: GenerateContentOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const generationConfig: Record<string, unknown> = {};
  if (opts.responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = opts.responseSchema;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: opts.userContent }] }],
        generationConfig,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error(`Gemini response missing text: ${JSON.stringify(data)}`);
  }
  return text;
}
