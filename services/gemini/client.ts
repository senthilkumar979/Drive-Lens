import { GoogleGenerativeAI } from "@google/generative-ai";
import { hasGeminiKey } from "@/lib/env";

export async function generateInsight(prompt: string): Promise<string> {
  if (!hasGeminiKey()) {
    return getMockInsight(prompt);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateWeeklyInsight(data: {
  distanceKm: number;
  energyKwh: number;
  tripCount: number;
  avgEfficiency: number;
  chargingCost: number;
}): Promise<{ summary: string; recommendations: string[] }> {
  const prompt = `You are DriveLens, an EV analytics assistant. Summarize this week's driving data in 2-3 sentences and give 3 bullet recommendations.

Data:
- Distance: ${data.distanceKm} km
- Energy: ${data.energyKwh} kWh
- Trips: ${data.tripCount}
- Efficiency: ${data.avgEfficiency} Wh/km
- Charging cost: $${data.chargingCost}

Format response as JSON: { "summary": "...", "recommendations": ["...", "..."] }`;

  if (!hasGeminiKey()) {
    return {
      summary: getMockInsight("weekly"),
      recommendations: [
        "Charge during off-peak hours to reduce costs.",
        "Precondition while plugged in to improve efficiency.",
        "Review trips over 80 km/h for energy savings.",
      ],
    };
  }

  const text = await generateInsight(prompt);
  try {
    const json = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      summary: json.summary ?? text,
      recommendations: json.recommendations ?? [],
    };
  } catch {
    return { summary: text, recommendations: [] };
  }
}

function getMockInsight(context: string): string {
  return `Based on your ${context} data, your driving efficiency is strong. Battery usage patterns suggest mostly urban trips with occasional highway runs. Consider scheduling charging during off-peak hours for lower costs.`;
}
