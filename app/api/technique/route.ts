import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { model } from "@/lib/gemini";
import { techniqueConfig } from "@/lib/technique-config";

export async function POST(req: Request) {
  try {
    const { todoId, technique } = await req.json();

    // ✅ 1. Connect to DB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const todo = await db
      .collection("todos")
      .findOne({ _id: new ObjectId(todoId) });

    if (!todo) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // ✅ 2. Get technique details from config
    const techKey = technique.toLowerCase().replace(/\s+/g, "-");
    const techData = techniqueConfig[techKey];

    if (!techData) {
      return NextResponse.json(
        { error: `Unknown technique: ${technique}` },
        { status: 400 }
      );
    }

    // ✅ 3. Build AI Prompt
    const prompt = `
You are a productivity assistant helping users apply different focus techniques.

Technique: ${techData.name}
Available UI Components: ${techData.components.join(", ")}

Task Title: ${todo.title}
Description: ${todo.description || "No description provided."}

Generate a workspace plan for this technique, tailored to the task.
Use ONLY the provided components when suggesting a UI.

Respond STRICTLY in JSON with:
{
  "ui_components": ["selected components from list"],
  "layout": "layout type (${techData.layout})",
  "guidance": "clear motivational instructions",
  "html_summary": "short HTML snippet for top section (no scripts, safe HTML)"
}

Be concise and user-friendly. Avoid developer jargon.
Example HTML: <h2>Focus Time</h2><p>Let's master React in short Pomodoro sprints.</p>
`;

    // ✅ 4. Get AI response
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // ✅ 5. Extract valid JSON
    const match = raw.match(/```json([\s\S]*?)```/);
    const jsonText = match ? match[1].trim() : raw;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { guidance: raw };
    }

    // ✅ 6. Return structured result
    return NextResponse.json({ result: parsed });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Gemini analysis failed" },
      { status: 500 }
    );
  }
}
