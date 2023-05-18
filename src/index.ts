import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { storage } from "./utils/upload-audio";
import cors from "cors";
import { transcribe } from "./openai";
import fetch from "node-fetch";

dotenv.config();

const app: Express = express();
app.use(cors());
const port = process.env.PORT;

const upload = multer({ storage });

app.post(
  "/api/upload-audio",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No audio file found" });
        return;
      }

      console.log("Transcribing ...");
      const transcription = await transcribe(file.path);

      console.log("Summarizing ...");
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: process.env.PROMPT,
              },
              {
                role: "user",
                content: transcription,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      const summary: any = await response.json();

      res.json({ summary });
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .json({ error: "Ocurrió un error al subir el archivo de audio" });
    }
  }
);

app.get("/", (_, res: Response) => {
  console.log("Request received!");
  res.send("SummarEase API up and running! ⚡️");
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
