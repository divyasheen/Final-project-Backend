import express from 'express';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

router.post("/", async (req, res) => {
    const { messages } = req.body

    const userMessage = messages[messages.length - 1].content

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + process.env.CHATBOT_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: userMessage,
            parameters: {
                max_new_tokens: 100,
                return_full_text: false
            }
        }),
    })

    const data = await response.json()
    const reply = data.generated_text || data[0]?.generated_text || "Sorry, I couldn't process your request."

    res.json({ reply })
})

export default router;