import { GoogleGenAI, Type } from "@google/genai";
import { LifeEvent, UserProfile } from "../types";

const FALLBACK_EVENTS: LifeEvent[] = [
  { age: 3, content: "学会了说话，第一次叫了爸爸妈妈", impact: 2, type: 'RANDOM' },
  { age: 7, content: "进入小学，对世界充满好奇", impact: 1, type: 'CAREER' },
  { age: 18, content: "参加高考，感受到了人生的压力", impact: -2, type: 'CAREER' },
  { age: 22, content: "大学毕业，迷茫中寻找方向", impact: 0, type: 'CAREER' },
  { age: 30, content: "事业进入上升期，但感到身体疲惫", impact: 3, type: 'WEALTH' },
  { age: 45, content: "家庭美满，但面临中年危机", impact: -1, type: 'HEALTH' },
  { age: 60, content: "退休生活开始，享受天伦之乐", impact: 5, type: 'RANDOM' },
];

export const generateLifeScript = async (profile: UserProfile): Promise<LifeEvent[]> => {
  // Check availability but assume it is pre-configured as per guidelines
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Using fallback data.");
    return FALLBACK_EVENTS;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    你是一位精通命理与社会学的算命大师。请根据以下信息，为一个人的"人生K线图"生成关键的人生转折点事件。
    
    姓名: ${profile.name}
    出生日期: ${profile.birthDate}
    性别: ${profile.gender === 'MALE' ? '男' : profile.gender === 'FEMALE' ? '女' : '其他'}
    
    请生成 15 到 20 个关键人生节点（覆盖0到80岁）。
    每个事件需要有一个 "impact" 分数，范围从 -10 (极度悲惨/崩盘) 到 +10 (极度幸运/暴涨)。
    事件内容要简练、深刻，带有宿命感，类似金融市场的利好利空消息。
    例如："遭遇情感熔断，各种均线破位" 或 "获得天使轮投资，人生估值翻倍"。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              age: { type: Type.INTEGER, description: "Age at which event occurs (0-80)" },
              content: { type: Type.STRING, description: "Description of the event" },
              impact: { type: Type.NUMBER, description: "Impact score from -10 to 10" },
              type: { 
                type: Type.STRING, 
                enum: ['CAREER', 'LOVE', 'HEALTH', 'WEALTH', 'RANDOM'],
                description: "Category of the event"
              }
            },
            required: ["age", "content", "impact", "type"]
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty response");
    
    const events = JSON.parse(jsonStr) as LifeEvent[];
    return events.sort((a, b) => a.age - b.age);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_EVENTS;
  }
};