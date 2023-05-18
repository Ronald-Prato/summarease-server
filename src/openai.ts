const { Configuration, OpenAIApi } = require("openai");
import fs from "fs";

export async function transcribe(audioPath: string): Promise<string> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const audio = fs.createReadStream(audioPath);

  const response = await openai.createTranscription(
    audio, // The audio file to transcribe.
    "whisper-1", // The model to use for transcription.
    // undefined, // The prompt to use for transcription.
    // "json", // The format of the transcription.
    // 1, // Temperature
    "es" // Language
  );

  return response.data.text;
}
