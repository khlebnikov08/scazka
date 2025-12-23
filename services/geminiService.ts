import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in process.env");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBedtimeStory = async (config: GenerationConfig): Promise<{ title: string; content: string }> => {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';

  const langInstruction = config.language === 'ru' 
    ? "STRICTLY WRITE THE STORY IN RUSSIAN LANGUAGE." 
    : "Write the story in English.";

  let prompt = '';

  if (config.dayEvents) {
    // Mode B: From Day
    prompt = `
      ${langInstruction}
      Create a bedtime story for a child named ${config.childName}.
      
      Context from the day: "${config.dayEvents}"
      
      Task:
      1. Gently transfer these real-world events into a fantasy or calming setting.
      2. The child ${config.childName} is the main character.
      3. The story must be therapeutic and resolve in a way that leads to sleep.
      4. Duration target: ${config.duration}.
      5. STRICTLY AVOID these topics: ${config.restrictions}.
      
      Output format: JSON with keys "title" and "content".
    `;
  } else {
    // Mode C: By Theme
    prompt = `
      ${langInstruction}
      Create a bedtime story for a child named ${config.childName}.
      
      Theme: "${config.theme}"
      Duration target: ${config.duration}.
      STRICTLY AVOID these topics: ${config.restrictions}.
      
      Output format: JSON with keys "title" and "content".
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const json = JSON.parse(text);
    return {
      title: json.title || "A Magical Night",
      content: json.content || text
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback for demo stability if API fails
    return {
      title: config.language === 'ru' ? "Тихая Луна" : "The Silent Moon",
      content: config.language === 'ru' 
        ? "Однажды луна улыбнулась с небес..." 
        : "Once upon a time, the moon smiled down..."
    };
  }
};

export const transcribeUserAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const ai = getClient();
  // Using the native audio model as recommended for audio tasks
  const model = 'gemini-2.5-flash-native-audio-preview-09-2025';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          { text: "Transcribe this audio description of events strictly verbatim. Do not add any commentary." }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};