
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getLevelDescription(level: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `할리갈리 게임 ${level}단계에 대한 짧고 재미있는 격려 문구와 팁을 한 문장으로 작성해줘. 과일 테마로!`,
    });
    return response.text || "준비됐나요? 과일을 잘 지켜보세요!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "과일이 5개가 되면 누구보다 빠르게 종을 치세요!";
  }
}
