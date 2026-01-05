import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { model } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const tasks = await db.collection("todos")
      .find({ userId: user._id })
      .sort({ created_at: -1 })
      .toArray();

    const prompt = `
      You are an AI productivity coach. Categorize these tasks into smart priority groups and provide actionable tips for each task.

      Tasks:
      ${JSON.stringify(tasks, null, 2)}

      Return ONLY JSON with this structure:

      {
        "focus": [
          {
            "title": "task title",
            "description": "task description",
            "_id": "task id",
            "tip": "A specific, actionable tip to help complete this task efficiently",
            "estimatedTime": "15-30 min",
            "difficulty": "Medium",
            "aiInsight": "Why this is high priority and how to approach it"
          }
        ],
        "quick_wins": [],
        "deep_work": [],
        "optional": []
      }

      For each task provide:
      - tip: Specific, actionable advice (1-2 sentences)
      - estimatedTime: Realistic time estimate (e.g., "10-15 min", "1-2 hours")
      - difficulty: Easy, Medium, Hard, or Extreme
      - aiInsight: Brief explanation of priority and approach strategy

      Make tips:
      - Specific and actionable
      - Practical and realistic
      - Encouraging but not generic
      - Include time-saving strategies when relevant
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

// Enhanced endpoint for on-demand AI insights
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const taskTitle = searchParams.get('title');
    const taskDesc = searchParams.get('description');
    const action = searchParams.get('action'); // 'breakdown', 'motivate', 'strategy'

    if (!taskTitle) {
      return NextResponse.json({ error: "Task title required" }, { status: 400 });
    }

    const taskInfo = {
      title: taskTitle,
      description: taskDesc || '',
      _id: taskId
    };

    let prompt = "";

    switch (action) {
      case 'breakdown':
        prompt = `
          Break down this task into 3-5 smaller, manageable action steps:
          Task: ${taskInfo.title}
          Description: ${taskInfo.description}
          
          Make each step specific and actionable.
          Return ONLY JSON: { "steps": ["step 1", "step 2", ...] }
        `;
        break;
      
      case 'motivate':
        prompt = `
          Provide HIGH-ENERGY motivation for this task in 2-3 sentences:
          Task: ${taskInfo.title}
          
          Be enthusiastic, empowering, and action-focused. Use powerful language.
          Return ONLY JSON: { "message": "your motivational message" }
        `;
        break;
      
      case 'strategy':
        prompt = `
          Provide a WINNING STRATEGY for this task:
          Task: ${taskInfo.title}
          Description: ${taskInfo.description}
          
          Give 2-3 tactical approaches or pro tips to crush this task efficiently.
          Return ONLY JSON: { "strategies": ["strategy 1", "strategy 2", ...] }
        `;
        break;
      
      case 'obstacles':
        prompt = `
          Identify potential obstacles for this task and how to overcome them:
          Task: ${taskInfo.title}
          
          List 2-3 common blockers and quick solutions.
          Return ONLY JSON: { "obstacles": [{"blocker": "issue", "solution": "fix"}] }
        `;
        break;
      
      default:
        prompt = `
          Provide a specific, actionable tip for completing this task efficiently:
          Task: ${taskInfo.title}
          
          Return ONLY JSON: { 
            "tip": "specific actionable advice",
            "estimatedTime": "15-30 min",
            "difficulty": "Medium"
          }
        `;
    }

    const result = await model.generateContent(prompt);
    let raw = result.response.text();

    const match = raw.match(/```json([\s\S]*?)```/);
    const jsonText = match ? match[1].trim() : raw;
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("AI insight error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}