"use client";

import { useEffect, useState } from "react";

export default function PrioritizedPage() {
  const [groups, setGroups] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const fetchAIPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prioritize", { method: "POST" });
      const data = await res.json();
      setGroups(data.groups);
    } catch (err) {
      console.error("Failed to load AI plan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIPlan();
  }, []);

  const toggleComplete = (taskId: string) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 bg-purple-500 opacity-20 mx-auto"></div>
            <div className="relative inline-block animate-spin rounded-full h-20 w-20 border-4 border-purple-900 border-t-purple-400 shadow-lg shadow-purple-500/50"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
            AI Brain Processing...
          </h2>
          <div className="space-y-2 text-purple-200">
            <p className="text-sm">⚡ Analyzing task complexity</p>
            <p className="text-sm">🎯 Calculating impact scores</p>
            <p className="text-sm">🔥 Optimizing your workflow</p>
          </div>
        </div>
      </main>
    );
  }

  if (!groups) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800 rounded-3xl shadow-2xl p-10 max-w-md border border-red-500/30">
          <div className="text-7xl mb-6 animate-bounce">💥</div>
          <h2 className="text-3xl font-bold text-white mb-3">AI Hiccup!</h2>
          <p className="text-slate-300 mb-8">
            Our AI took a coffee break. Let's try that again.
          </p>
          <button
            onClick={fetchAIPlan}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70"
          >
            Retry Analysis
          </button>
        </div>
      </main>
    );
  }

  const sections = [
    {
      title: "Focus Zone",
      subtitle: "MAXIMUM IMPACT",
      emoji: "🎯",
      items: groups.focus || [],
      gradient: "from-rose-500 via-pink-500 to-rose-600",
      bgGradient: "from-rose-950/40 to-pink-950/40",
      borderGlow: "border-rose-500/50 shadow-lg shadow-rose-500/20",
      description: "Game-changing tasks that move the needle",
      tip: "Do these FIRST. Everything else can wait.",
      intensity: "HIGH",
    },
    {
      title: "Quick Wins",
      subtitle: "MOMENTUM BUILDERS",
      emoji: "⚡",
      items: groups.quick_wins || [],
      gradient: "from-amber-500 via-orange-500 to-amber-600",
      bgGradient: "from-amber-950/40 to-orange-950/40",
      borderGlow: "border-amber-500/50 shadow-lg shadow-amber-500/20",
      description: "Fast victories to build unstoppable momentum",
      tip: "Crush these between deep work sessions",
      intensity: "MEDIUM",
    },
    {
      title: "Deep Work",
      subtitle: "FLOW STATE REQUIRED",
      emoji: "🔥",
      items: groups.deep_work || [],
      gradient: "from-purple-500 via-indigo-500 to-purple-600",
      bgGradient: "from-purple-950/40 to-indigo-950/40",
      borderGlow: "border-purple-500/50 shadow-lg shadow-purple-500/20",
      description: "Complex challenges that demand your full brain power",
      tip: "Block 2-4 hours. No interruptions. Pure focus.",
      intensity: "EXTREME",
    },
    {
      title: "Nice to Have",
      subtitle: "BONUS ROUND",
      emoji: "✨",
      items: groups.optional || [],
      gradient: "from-slate-500 via-slate-600 to-slate-700",
      bgGradient: "from-slate-950/40 to-slate-900/40",
      borderGlow: "border-slate-500/50 shadow-lg shadow-slate-500/20",
      description: "Only tackle these after crushing your priorities",
      tip: "Reward yourself with these after winning the day",
      intensity: "OPTIONAL",
    },
  ];

  const totalTasks = Object.values(groups).reduce(
    (sum: number, arr: any) => sum + (arr?.length || 0),
    0
  );
  const completedCount = completedTasks.size;
  const completionRate =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const highPriorityCount =
    (groups.focus?.length || 0) + (groups.deep_work?.length || 0);

  const getMotivationalMessage = () => {
    if (completionRate >= 80) {
      return {
        text: "LEGENDARY! You're crushing it today! 🏆",
        color: "text-yellow-400",
      };
    }
    if (completionRate >= 50) {
      return {
        text: "ON FIRE! Keep that momentum going! 🔥",
        color: "text-orange-400",
      };
    }
    if (completedCount > 0) {
      return {
        text: "PROGRESS! Every task completed is a win! 💪",
        color: "text-green-400",
      };
    }
    if (totalTasks === 0) {
      return {
        text: "ALL CLEAR! Time to plan your next move! ✨",
        color: "text-purple-400",
      };
    }
    if (highPriorityCount <= 3) {
      return {
        text: `${highPriorityCount} HIGH-IMPACT TASKS. Let's dominate! 🎯`,
        color: "text-rose-400",
      };
    }
    return {
      text: "GAME ON! One task at a time. You got this! 💥",
      color: "text-indigo-400",
    };
  };

  const message = getMotivationalMessage();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-4 py-3 rounded-xl border-2 border-purple-500/30 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 group"
          >
            <svg
              className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
              BACK TO MISSIONS
            </span>
          </a>
        </div>
        {/* Epic Status Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <h2 className={`text-4xl font-black mb-3 ${message.color}`}>
                {message.text}
              </h2>
              <p className="text-purple-200 text-sm leading-relaxed max-w-2xl">
                Our AI analyzed every task for maximum impact. Hit focus tasks
                first, ride the momentum with quick wins, then dominate deep
                work.
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-5xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-white">
                  {completedCount}
                </div>
                <div className="text-xs text-purple-300 font-bold mt-1">
                  DONE
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-white">
                  {totalTasks}
                </div>
                <div className="text-xs text-purple-300 font-bold mt-1">
                  TOTAL
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-4 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/30">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-1000 ease-out shadow-lg shadow-purple-500/50"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-center text-purple-300 text-sm font-bold mt-2">
              {completionRate}% COMPLETE
            </p>
          </div>
        </div>

        {/* Impact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${section.bgGradient} backdrop-blur-sm rounded-2xl p-4 border-2 ${section.borderGlow} hover:scale-105 transition-transform`}
            >
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-br ${section.gradient} bg-clip-text text-white">
                {section.items.length}
              </div>
              <div className="text-xs text-white font-bold mt-1 uppercase opacity-80">
                {section.title}
              </div>
              <div className="text-[10px] text-purple-300 font-bold mt-0.5">
                {section.intensity}
              </div>
            </div>
          ))}
        </div>

        {/* Task Sections - Intense Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${section.bgGradient} backdrop-blur-sm border-2 ${section.borderGlow} rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center shadow-xl text-2xl`}
                  >
                    {section.emoji}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {section.title}
                    </h2>
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      {section.subtitle}
                    </p>
                    <p className="text-xs text-purple-200 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-xl text-lg font-black bg-gradient-to-br ${section.gradient} text-white shadow-xl`}
                >
                  {section.items.length}
                </span>
              </div>

              {/* Power Tip */}
              <div className="mb-4 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <p className="text-sm text-purple-100 font-bold flex-1">
                    {section.tip}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {section.items.length === 0 ? (
                  <div className="text-center py-12 text-purple-300">
                    <div className="text-5xl mb-3">🏆</div>
                    <p className="text-lg font-bold">CLEAR!</p>
                    <p className="text-xs mt-2 opacity-70">
                      Nothing blocking you here
                    </p>
                  </div>
                ) : (
                  section.items.map((item: any, i: number) => {
                    const taskId = `${idx}-${i}`;
                    const isCompleted = completedTasks.has(taskId);

                    return (
                      <div
                        key={i}
                        onClick={() => toggleComplete(taskId)}
                        className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border-2 ${
                          isCompleted
                            ? "border-green-500/50 bg-green-900/20"
                            : "border-slate-700/50"
                        } hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer group`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            <div
                              className={`w-7 h-7 rounded-xl border-3 ${
                                isCompleted
                                  ? "border-green-500 bg-green-500"
                                  : "border-purple-400 group-hover:border-purple-300"
                              } transition-all flex items-center justify-center shadow-lg`}
                            >
                              {isCompleted && (
                                <span className="text-white text-sm font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-bold text-white group-hover:text-purple-300 transition-colors text-lg ${
                                isCompleted ? "line-through opacity-50" : ""
                              }`}
                            >
                              {item.title}
                            </h3>
                            {item.description && (
                              <p
                                className={`text-sm text-purple-200 mt-2 leading-relaxed ${
                                  isCompleted ? "line-through opacity-50" : ""
                                }`}
                              >
                                {item.description}
                              </p>
                            )}
                            {item.estimatedTime && (
                              <div className="flex items-center gap-2 mt-3 text-xs text-purple-300 font-bold">
                                <span>⏱️</span>
                                <span>{item.estimatedTime}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Power Footer */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-500/30">
          <div className="text-center md:text-left flex-1">
            <p className="text-xl font-black text-white mb-2">
              FEELING THE PRESSURE? 💪
            </p>
            <p className="text-sm text-purple-200">
              One focus task = one win. Stack wins, dominate the day. That's the
              formula.
            </p>
          </div>
          <button
            onClick={fetchAIPlan}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:scale-105 flex items-center gap-3"
          >
            <span className="text-2xl">🔄</span>
            REFRESH AI PLAN
          </button>
        </div>

        {/* Footer Intensity Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
            AI-POWERED • IMPACT-OPTIMIZED • MOMENTUM-DRIVEN
          </p>
        </div>
      </div>
    </main>
  );
}
