import { GoogleGenerativeAI } from "@google/generative-ai";
import { TestCase } from "@/components/nodes/types";

// --- CHANGE IS HERE ---
// The example now shows a generic, sequential ID to guide the AI.
const expectedJsonFormat = `[
  { "id": "TC-001", "testCase": "Attempt to access admin endpoint as a normal user", "category": "Broken Access Control", "url": "", "exploited": "No", "status": "Not Applicable", "tester": "" },
  { "id": "TC-002", "testCase": "Submit SQL injection payload ' OR 1=1 -- to username field", "category": "Injection", "url": "", "exploited": "No", "status": "Not Applicable", "tester": "" }
]`;

export async function generateComprehensiveTestPlan(
    apiKey: string, 
    scope: string,
    makerRole: string,
    checkerRole: string,
    action: string,
    intensity: 'focused' | 'comprehensive'
): Promise<TestCase[]> {
  
  if (!apiKey) throw new Error("Gemini API Key is missing. Please add it in the settings.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const temperature = intensity === 'comprehensive' ? 0.8 : 0.3;

  const fullPrompt = `
    **Persona:** You are a Principal Security Engineer specializing in authorization and complex business logic flaws.

    **Task:**
    Your task is to generate a comprehensive set of security test cases for a "Maker-Checker" (two-step approval) workflow. Analyze the provided context and create a diverse list of tests focusing on bypassing or exploiting this authorization flow. Do not generate simple or repetitive tests.

    **Context of the Maker-Checker Flow:**
    - **Maker Role:** ${makerRole}
    - **Checker Role:** ${checkerRole}
    - **Action Being Performed:** ${action}
    - **General Scope:** ${scope}

    **Your primary goal is to test for the following critical vulnerability patterns:**
    1.  Authorization Bypass
    2.  Privilege Escalation
    3.  Data Tampering (TOCTOU)
    4.  Insecure Direct Object Reference (IDOR)
    5.  State Confusion
    6.  Cross-Site Request Forgery (CSRF)

    **Instructions:**
    - **Create a generic, sequential ID for each test case, starting with "TC-001" and incrementing for each subsequent case (TC-002, TC-003, etc.).**  <-- THIS IS THE NEW INSTRUCTION
    - The category MUST be a specific, professional vulnerability type.
    - The test case description MUST be a clear, actionable instruction.

    **CRITICAL OUTPUT FORMAT REQUIREMENTS:**
    - Your entire response MUST be a valid JSON array of objects.
    - Do NOT include any introductory text, explanations, or markdown formatting.
    - Each object in the array MUST contain "id", "testCase", "category", "url", "exploited", "status", "tester".
    - "exploited" MUST be "No", "status" MUST be "Not Applicable", "tester" and "url" MUST be empty strings.
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