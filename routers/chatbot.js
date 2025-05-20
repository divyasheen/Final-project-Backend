import express from "express";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

router.post("/", async (req, res) => {
  const { messages } = req.body;

  const formatted = messages
    .map((msg) => {
      if (msg.role === "user") return `User: ${msg.content}`;
      if (msg.role === "assistant") return `Assistant: ${msg.content}`;
      return "";
    })
    .join("\n");

  const prompt = `You are a helpful, brief, and consise AI assistant. When you write code, always wrap it in triple backticks and label the language, like \u0060\u0060\u0060js.\n${formatted}\nAssistant:`

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.CHATBOT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            return_full_text: false,
          },
        }),
      }
    );

    const data = await response.json();
    const full = data?.[0]?.generated_text || data?.generated_text || "Sorry..."
    const reply = full.split("User:")[0].trim()
    res.json({ reply });

  } catch (error) {
    console.error("Error fetching data from API:", error);
    res.status(500).json({ reply: "Internal Server Error" });

  }
});

export default router;
