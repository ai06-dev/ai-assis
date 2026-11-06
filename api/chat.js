// Vercel 함수: POST /api/chat
import { handleChat } from "../lib/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "요청 형식(JSON)이 올바르지 않습니다." });
    }
  }

  const result = await handleChat(body);
  return res.status(result.status).json(result.body);
}
