import http from "http";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { storage } from "./utils/upload-audio";
import cors from "cors";
import { transcribe } from "./openai";
import fetch from "node-fetch";
import fs from "fs";
import { socketsInit } from "./sockets-init";
import { Server, Socket } from "socket.io";

dotenv.config();

const app: Express = express();
app.use(cors());

const server = http.createServer(app);

const port = process.env.PORT;

const sockets = new Map<string, Socket>();

const updateSocketIds = (socketId: string, socket: Socket) => {
  sockets.set(socketId, socket);
};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketsInit(io, updateSocketIds);

const upload = multer({ storage });

app.post(
  "/api/upload-audio",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    const currentSocketId = req.body.socketId;
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No audio file found" });
        return;
      }

      const transcription = await transcribe(file.path);

      sockets.get(currentSocketId).emit("status-changed", 1);
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

      const data: any = await response.json();

      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error deleting the file ", err);
        }
      });

      res.json({ summary: data.choices[0].message.content });
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .json({ error: "Ocurrió un error al subir el archivo de audio" });
    }
  }
);

app.get("/", (_, res: Response) => {
  res.send("SummarEase API up and running! ⚡️");
});

server.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
