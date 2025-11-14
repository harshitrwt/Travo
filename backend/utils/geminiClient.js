import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("Ensure GEMINI_API_KEY is set in backend/.env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a VALID Gemini model
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export async function translateText(text, targetLang) {
  try {
    const prompt = `
Translate the following text into ${targetLang}. 
Return only the translated text, no explanations.

Text:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response;

  } catch (error) {
    console.error("translate error:", error);
    throw new Error("Gemini API error: " + error.message);
  }
}
