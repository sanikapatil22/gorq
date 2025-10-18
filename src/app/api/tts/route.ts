import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const { text, voice = "Fritz-PlayAI" } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const speechFilePath = "speech.wav";
    const model = "playai-tts";
    const responseFormat = "wav";

    const response = await groq.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: responseFormat
    });
    
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(speechFilePath, buffer);

    return NextResponse.json({ success: true, path: speechFilePath });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS failed" },
      { status: 500 }
    );
  }
}