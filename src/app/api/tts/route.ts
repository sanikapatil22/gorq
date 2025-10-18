import fs from "fs";
import path from "path";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const speechFilePath = "speech.wav";
const model = "playai-tts";
const voice = "Fritz-PlayAI";
const text = "I love building and shipping new features for our users!";
const responseFormat = "wav";

async function main() {
  const response = await groq.audio.speech.create({
    model: model,
    voice: voice,
    input: text,
    response_format: responseFormat
  });
  
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(speechFilePath, buffer);
}

main();