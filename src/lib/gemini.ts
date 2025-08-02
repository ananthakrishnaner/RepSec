import { GoogleGenerativeAI } from "@google/generative-ai";
import { TestCase } from "@/components/nodes/types";

// --- CHANGE IS HERE ---
// The example now shows an empty "url" field to guide the AI.
const expectedJsonFormat = `[
  { "id": "TC-BAC-001", "testCase": "Attempt to access admin endpoint as a normal user", "category": "Broken Access Control", "url": "", "exploited": "No", "status": "Not Applicable", "tester": "" }
]`;

export async function generateComprehensiveTestPlan(
    apiKey: string, 
    scope: string, 
    intensity: 'focused' | 'comprehensive'
): Promise<TestCase[]> {
  
  if (!apiKey) throw new Error("Gemini API Key is missing. Please add it in the settings.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const temperature = intensity === 'comprehensive' ? 0.9 : 0.4;

  const fullPrompt = `
    **Persona:** You are a creative, world-class principal penetration tester. Your goal is to find edge cases and unique attack vectors that others might miss.

    **Task:**
    Analyze the provided "Scope of Test" and generate a comprehensive list of at least 15-20 diverse security test cases based on the OWASP Top 10 framework.

    **Scope of Test:**
    ---
    ${scope}
    ---
    
    **Instructions:**
    1.  **Analyze Scope:** Identify key features from the scope.
    2.  **Generate Diverse Vectors:** For each feature, create relevant and unique test cases from multiple applicable OWASP categories. AVOID creating simple, repetitive checks.
    3.  **Create Unique IDs:** Create a unique, descriptive ID for each test case (e.g., TC-BAC-001).

    **CRITICAL OUTPUT FORMAT REQUIREMENTS:**
    - Your entire response MUST be a valid JSON array of objects.
    - Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json.
    - Each object in the array MUST contain all of the following keys: "id", "testCase", "category", "url", "exploited", "status", "tester".
    - The "exploited" value MUST be "No".
    - The "status" value MUST be "Not Applicable".
    - The "tester" value MUST be an empty string.
    - **The "url" value MUST be an empty string.** <-- THIS IS THE NEW INSTRUCTION

    - Example of required output format: ${expectedJsonFormat}
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: temperature
      },
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    if (!Array.isArray(parsedData)) {
      console.error("AI response was not a JSON array:", parsedData);
      throw new Error("The AI response was not in the expected format (JSON array).");
    }

    return parsedData as TestCase[];
  } catch (error) {
    console.error("Gemini API Error or JSON parsing failed:", error);
    throw new Error("Failed to generate test cases from the AI. Check API key, model access, and browser console.");
  }
}