
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ValentineDay } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateValentineContent(
  partnerName: string, 
  day: ValentineDay
) {
  const prompt = `Act as a world-class romantic poet. 
  Generate a personalized greeting for Valentine's Week.
  Recipient: ${partnerName}.
  Sender: Anonymous (use terms like "Your Valentine").
  Occasion: ${day}.
  Please provide:
  1. A short, beautiful romantic quote (1-2 lines).
  2. A heartfelt wish specifically for ${day} mentioning ${partnerName}.
  Return the output in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            wish: { type: Type.STRING }
          },
          required: ["quote", "wish"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (error) {
    console.error("Error generating text content:", error);
    return {
      quote: "Love is not about how many days, weeks or months you've been together, it's all about how much you love each other every day.",
      wish: `Happy ${day}, ${partnerName}! May our love bloom beautifully.`
    };
  }
}

export async function generateRomanticAudio(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak this romantically and softly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received");
    
    return base64Audio;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
}

// Audio Utilities
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
