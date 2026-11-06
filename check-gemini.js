import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// 오류 메시지에 키가 섞여 나오지 않도록 가린다.
function hideKey(text) {
  const s = String(text ?? "");
  return apiKey ? s.split(apiKey).join("[숨김]") : s;
}

if (!apiKey || apiKey === "여기에_키_입력") {
  console.error("실패: GEMINI_API_KEY가 .env에 없거나 견본 값 그대로입니다.");
  process.exit(1);
}

console.log(`사용 모델: ${model}`);

try {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: '"연결 성공"이라고 한 문장으로만 답해줘.',
  });
  console.log("Gemini 응답:", response.text?.trim());
} catch (err) {
  console.error("실패");
  console.error("상태 코드:", err?.status ?? "(없음)");
  console.error("메시지:", hideKey(err?.message).slice(0, 500));
  process.exit(1);
}
