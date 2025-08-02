import { GoogleGenerativeAI } from "@google/generative-ai";
import { TestCase } from "@/components/nodes/types";

const expectedJsonFormat = `[
  { "id": "TC-001", "testCase": "As the Maker, create a valid, low-impact request. Intercept and note the request ID. Then, immediately send a second, unauthorized request to an update endpoint (e.g., PUT /api/requests/{id}) to change critical data (e.g., amount, recipient) before the Checker approves the original.", "category": "Data Tampering (TOCTOU)", "url": "", "exploited": "No", "status": "Not Applicable", "tester": "" }
]`;

export async function generateComprehensiveTestPlan(
    apiKey: string, 
    userPrompt: string, 
    intensity: 'focused' | 'comprehensive'
): Promise<TestCase[]> {
  
  if (!apiKey) throw new Error("Gemini API Key is missing. Please add it in the settings.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const temperature = intensity === 'comprehensive' ? 0.8 : 0.3;

  const fullPrompt = `
    **Persona:** You are a world-class Principal Security Engineer specializing in authorization, business logic, and complex workflow vulnerabilities.

    **Task:**
    Your task is to analyze the user's description of a workflow and generate a comprehensive security test plan. The test cases must be intelligent, diverse, and focus on unique attack vectors.

    **User's Workflow Description:**
    ---
    ${userPrompt}
    ---
    
    **Your Thought Process:**
    1.  **Deconstruct the Input:** First, carefully read the user's description. Identify the key actors or roles (e.g., "Maker," "Checker," "Clerk," "Manager"). Identify the critical state-changing action being performed (e.g., "transfer funds," "publish article," "create user").
    2.  **Apply Security Frameworks:** Based on the roles and action, create test cases that probe for common vulnerabilities in such systems, focusing heavily on:
        *   **Authorization Bypasses:** Can the Maker perform the Checker's final approval action?
        *   **Time-of-Check to Time-of-Use (TOCTOU) / Data Tampering:** Can the Maker alter the transaction *after* submission but *before* approval? This is a high-priority test.
        *   **Privilege Escalation:** Can a lower-privilege user act as the Maker or Checker?
        *   **Insecure Direct Object Reference (IDOR):** Can User A act upon a transaction created by User B?
        *   **State Confusion:** Can an already approved or rejected request be re-submitted or re-approved?
        *   **General OWASP Top 10:** If the scope mentions APIs or user input, include relevant Injection, XSS, and Security Misconfiguration tests.
    3.  **Ensure Diversity:** Do not generate repetitive tests. Each test case should represent a unique attack vector or approach.

    **CRITICAL OUTPUT FORMAT REQUIREMENTS:**
    - Your entire response MUST be a valid JSON array of objects.
    - Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json.
    - Each object in the array MUST contain all the following keys: "id", "testCase", "category", "url", "exploited", "status", "tester".
    - "id" MUST be a generic, sequential ID (e.g., "TC-001", "TC-002").
    - "exploited" MUST be "No", "status" MUST be "Not Applicable".
    - "tester" and "url" MUST be empty strings.
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