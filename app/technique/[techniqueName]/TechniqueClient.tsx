"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { techniqueConfig } from "@/lib/technique-config";

// ✅ Dynamic imports for all technique widgets
const PomodoroTimer = dynamic(() => import("@/components/techniques/PomodoroTimer"));
const FocusTracker = dynamic(() => import("@/components/techniques/FocusTracker"));
const NotesPad = dynamic(() => import("@/components/techniques/NotesPad"));
const EisenhowerMatrix = dynamic(() => import("@/components/techniques/EisenhowerMatrix"));
const DeepWorkSession = dynamic(() => import("@/components/techniques/DeepWorkSession"));
const TimeBlockPlanner = dynamic(() => import("@/components/techniques/TimeBlockPlanner"));

interface TechniqueResult {
  ui_components?: string[];
  layout?: string;
  guidance?: string;
  html_summary?: string;
}

export default function TechniqueClient({ techniqueName }: { techniqueName: string }) {
  const searchParams = useSearchParams();
  const todoId = searchParams.get("id");
  const [result, setResult] = useState<TechniqueResult | null>(null);
  const [loading, setLoading] = useState(true);

  const techKey = techniqueName.toLowerCase().replace(/\s+/g, "-");
  const techniqueData = techniqueConfig[techKey];

  useEffect(() => {
    if (!todoId) return;

    const analyzeTask = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/technique", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todoId, technique: techniqueName }),
        });
        const data = await res.json();
        setResult(data.result);
      } catch (err) {
        console.error("Failed to analyze task:", err);
      } finally {
        setLoading(false);
      }
    };

    analyzeTask();
  }, [todoId, techniqueName]);

  // ✅ Render components dynamically
  const renderComponent = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("pomodoro")) return <PomodoroTimer />;
    if (key.includes("focus")) return <FocusTracker />;
    if (key.includes("note")) return <NotesPad />;
    if (key.includes("eisenhower")) return <EisenhowerMatrix />;
    if (key.includes("deep work")) return <DeepWorkSession />;
    if (key.includes("time block")) return <TimeBlockPlanner />;
    return (
      <div className="p-4 bg-slate-50 border rounded-lg text-slate-600">
        ⚙️ {name}
      </div>
    );
  };

  if (loading)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-slate-500">
        <div className="animate-pulse text-lg">Analyzing your task with AI...</div>
      </main>
    );

  if (!result)
    return (
      <main className="min-h-screen flex items-center justify-center text-slate-600">
        ❌ Could not generate workspace. Please try again.
      </main>
    );

  // ✅ Determine layout style
  const layoutType = result.layout || techniqueData?.layout || "two-column";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 p-6 flex flex-col items-center">
      {/* 🧠 Top Section */}
      <div className="max-w-4xl w-full text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 capitalize">
          {techniqueData?.name || techniqueName} Workspace
        </h1>

        {result.html_summary && (
          <div
            className="prose max-w-2xl mx-auto mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm"
            dangerouslySetInnerHTML={{ __html: result.html_summary }}
          />
        )}

        {result.guidance && (
          <p className="text-slate-600 mb-2 italic text-center">
            💡 {result.guidance}
          </p>
        )}
      </div>

      {/* 🧩 Layout Rendering */}
      <div className="w-full max-w-6xl">
        {layoutType.includes("two-column") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {result.ui_components
                ?.filter(
                  (name) =>
                    ["pomodoro", "focus", "tracker", "session", "matrix"].some((k) =>
                      name.toLowerCase().includes(k)
                    )
                )
                .map((comp, i) => <div key={i}>{renderComponent(comp)}</div>)}
            </div>
            <div>
              {result.ui_components?.some((name) =>
                name.toLowerCase().includes("note")
              ) ? (
                result.ui_components
                  .filter((name) => name.toLowerCase().includes("note"))
                  .map((comp, i) => <div key={i}>{renderComponent(comp)}</div>)
              ) : (
                <NotesPad />
              )}
            </div>
          </div>
        )}

        {layoutType.includes("grid") && (
          <div className="space-y-6">
            {result.ui_components?.map((comp, i) => (
              <div key={i}>{renderComponent(comp)}</div>
            ))}
          </div>
        )}

        {layoutType.includes("stacked") && (
          <div className="flex flex-col gap-6">
            {result.ui_components?.map((comp, i) => (
              <div key={i}>{renderComponent(comp)}</div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
