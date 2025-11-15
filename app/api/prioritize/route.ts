import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { model } from "@/lib/gemini";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const tasks = await db.collection("todos")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    const prompt = `
      You are an AI productivity coach. Categorize these tasks into smart priority groups.

      Tasks:
      ${JSON.stringify(tasks, null, 2)}

      Return ONLY JSON with this structure:

      {
        "focus": [],
        "quick_wins": [],
        "deep_work": [],
        "optional": []
      }
    `;

    const result = await model.generateContent(prompt);
    let raw = result.response.text();

    // Extract JSON safely
    const match = raw.match(/```json([\s\S]*?)```/);
    const jsonText = match ? match[1].trim() : raw;

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({ groups: parsed });
  } catch (err: any) {
    console.error("AI error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
