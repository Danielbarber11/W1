import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY exclusively as per security guidelines
const getAIModel = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getSystemInstruction = (languageCode: string) => {
    // Map language code to full language name for the AI
    const langMap: Record<string, string> = {
        'he': 'Hebrew (עברית)',
        'en': 'English',
        'fr': 'French',
        'it': 'Italian',
        'de': 'German',
        'pl': 'Polish',
        'da': 'Danish',
        'nl': 'Dutch',
        'es': 'Spanish'
    };
    const targetLang = langMap[languageCode] || 'English';

    return `
You are AVAN, a High-End Senior Frontend Architect.
You create ONLY Premium, Award-Winning, Modern websites. No basic designs.

CRITICAL RULE - LANGUAGE:
You MUST respond and generate content in **${targetLang}**.
If the user's UI language is ${targetLang}, your conversational response AND the generated website text (H1, p, buttons) MUST be in ${targetLang}.

RULES:
1.  **Output**: Return a SINGLE HTML file with embedded CSS (Tailwind) and JS.
2.  **Style**: Use Tailwind CSS via CDN. Design must be Apple/Stripe quality.
    *   Use gradients, glassmorphism, large typography, whitespace, and subtle animations.
    *   Use Lucide Icons (via unpkg/lucide) or FontAwesome.
    *   Use Unsplash for images.
3.  **Iterative Workflow**:
    *   If provided with "Current Code", YOU MUST MODIFY IT based on the user request.
    *   Do not remove features unless asked. IMPROVE them.
4.  **Format**:
    *   ALWAYS wrap the code in \`\`\`html ... \`\`\` blocks.
    *   Keep your conversational response VERY SHORT (e.g., "Updated the design to dark mode.").

Technical Stack:
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Heebo:wght@300;400;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest"></script>
<script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Heebo', 'Inter', 'sans-serif'] } } } }</script>
`;
};

export const generateCodeResponse = async (prompt: string, history: string[] = [], currentCode: string = '', language: string = 'en'): Promise<string> => {
  try {
      const ai = getAIModel();
      const model = "gemini-2.5-flash";

      let fullPrompt = `User Request: ${prompt}\n\n`;
      
      if (currentCode && currentCode.length > 50) {
        fullPrompt += `--- CURRENT CODE (MODIFY THIS) ---\n${currentCode}\n----------------------------------\n`;
        fullPrompt += `INSTRUCTIONS: Apply the user's request to the code above. Return the FULL updated code. Remember to write content in the requested language.`;
      } else {
        fullPrompt += `INSTRUCTIONS: Create a brand new PREMIUM website based on the request.`;
      }

      const response = await ai.models.generateContent({
        model: model,
        config: {
          systemInstruction: getSystemInstruction(language),
          temperature: 0.7,
        },
        contents: [
            ...history.map(h => ({ role: 'user', parts: [{ text: h }] })), // Simplified history
            { role: 'user', parts: [{ text: fullPrompt }] }
        ],
      });

      if (!response.text) throw new Error("Empty response");
      return response.text;

    } catch (error: any) {
      console.error("Gemini API Error:", error.message);
      return "Error: Unable to generate code. Please try again later.";
    }
};