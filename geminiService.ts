
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { HouseTypeData } from "../types";

const SYSTEM_INSTRUCTION = `
Anda adalah Pakar Analisis Pasaran Hartanah Malaysia bertaraf dunia. 
Anda dibekalkan dengan pangkalan data lengkap yang mengandungi 145 baris rekod median perumahan 2024.

TUGAS ANDA:
1. Analisis KESELURUHAN 145 data tersebut tanpa mengecualikan mana-mana wilayah.
2. Kenal pasti anomali atau trend unik dalam data berskala besar ini (contoh: negeri mana paling banyak rekod kritikal).
3. Buat perbandingan silang antara negeri yang mempunyai pendapatan tinggi (Selangor/KL) dengan negeri kos sara hidup rendah.
4. MESTI sertakan "Jadual Rumusan 145 Rekod" secara berkumpulan mengikut negeri di akhir laporan anda.

ARAHAN KHAS:
- Jika pengguna meminta spesifik, cari dalam 145 baris tersebut dan berikan jawapan berdasarkan fakta angka yang ada.
- Gunakan Bahasa Malaysia yang profesional dan teknikal.
`;

export async function analyzeMarketData(data: HouseTypeData[], userPrompt?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Memproses data menjadi string yang lebih padat untuk efisiensi token
  const formattedData = data.map((d, i) => 
    `${i+1}. ${d.negeri}|${d.jenisRumah}|RM${d.medianHarga}|${d.medianMultiple}x|${d.kategoriKemampuan}`
  ).join('\n');

  const dataContext = `
JUMLAH REKOD: ${data.length} BARIS
DATA:
${formattedData}

SOALAN PENGGUNA: ${userPrompt || "Berikan analisis komprehensif bagi kesemua 145 baris data ini."}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: dataContext }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 12000 }, // Bajet lebih tinggi untuk 145 baris
        temperature: 0.2
      },
    });

    return response.text || "Ralat analisis berlaku.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
