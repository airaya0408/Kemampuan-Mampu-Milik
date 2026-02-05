
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { RAW_PROPERTY_DATA } from "../constants";

const SYSTEM_PROMPT = `
Anda adalah "Ejen Hartanah AI 2024" yang memiliki pengetahuan penuh tentang KESELURUHAN set data perumahan Malaysia 2024.
Anda tidak boleh memberikan jawapan umum; anda MESTI merujuk kepada data spesifik yang diberikan.

Data Konteks (2024 - Penuh): 
${JSON.stringify(RAW_PROPERTY_DATA)}

TUGAS ANDA:
1. Memberikan jawapan yang sangat tepat berdasarkan setiap baris data (negeri, jenis rumah, harga median, multiple).
2. Jika pengguna meminta ringkasan, baca dan rumuskan trend dari semua 14 negeri/wilayah yang ada dalam data.
3. Bandingkan kemampuan antara negeri (contoh: Johor vs Selangor) menggunakan angka tepat dari konteks.
4. Gunakan nada yang mesra tetapi sangat berinformasi. Anda adalah sumber kebenaran data hartanah 2024 ini.

Gunakan format Markdown untuk jadual atau senarai.
`;

export class PropertyChatAgent {
  private chat: Chat;

  constructor() {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.5, // Mengurangkan kreativiti untuk fokus pada ketepatan data
      },
    });
  }

  async *sendMessage(message: string) {
    const result = await this.chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      yield response.text;
    }
  }
}
