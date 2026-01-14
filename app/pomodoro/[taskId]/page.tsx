"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";

interface Todo {
  _id: string;
  title: string;
  description: string;
  completed?: boolean;
  pomodoro?: {
    estimatedPomodoros: number;
    completedPomodoros: number;
    isActive: boolean;
    startTime?: Date;
  };
}

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export default function PomodoroPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [hasSetEstimate, setHasSetEstimate] = useState(false);

  // Timer states
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Timer durations (in seconds)
  const durations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch("/api/todos");
        const data = await response.json();
        const task = data.todos.find((t: Todo) => t._id === taskId);

        if (task) {
          setTodo(task);
          if (task.pomodoro) {
            setEstimatedPomodoros(task.pomodoro.estimatedPomodoros);
            setCompletedPomodoros(task.pomodoro.completedPomodoros);
            setHasSetEstimate(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play notification sound
    playNotificationSound();

    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Pomodoro Timer", {
        body: mode === "pomodoro"
          ? "Great work! Time for a break!"
          : "Break's over! Ready to focus?",
        icon: "/favicon.ico",
      });
    }

    if (mode === "pomodoro") {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);

      // Save progress
      saveProgress(newCompleted);

      // Switch to appropriate break
      if (newCompleted % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(durations.longBreak);
      } else {
        setMode("shortBreak");
        setTimeLeft(durations.shortBreak);
      }
    } else {
      // Break is over, go back to pomodoro
      setMode("pomodoro");
      setTimeLeft(durations.pomodoro);
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const saveProgress = async (completed: number) => {
    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: taskId,
          pomodoro: {
            estimatedPomodoros,
            completedPomodoros: completed,
            isActive: true,
            startTime: new Date(),
          },
        }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const handleSetEstimate = async () => {
    if (estimatedPomodoros < 1) return;

    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: taskId,
          pomodoro: {
            estimatedPomodoros,
            completedPomodoros: 0,
            isActive: true,
            startTime: new Date(),
          },
        }),
      });

      setHasSetEstimate(true);
      requestNotificationPermission();
    } catch (error) {
      console.error("Failed to set estimate:", error);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      requestNotificationPermission();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const resetPomodoroEstimate = async () => {
    const result = await Swal.fire({
      title: "🔄 RESET POMODORO?",
      text: "This will reset your estimate and clear all progress. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "YES, RESET IT!",
      cancelButtonText: "CANCEL",
      background: "#1e293b",
      color: "#ffffff",
      iconColor: "#f59e0b",
      customClass: {
        popup: "border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20",
        title: "text-2xl font-black uppercase tracking-wider",
        confirmButton:
          "font-bold px-6 py-3 rounded-xl uppercase tracking-wider hover:scale-105 transition-all",
        cancelButton:
          "font-bold px-6 py-3 rounded-xl uppercase tracking-wider hover:scale-105 transition-all",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: taskId,
          pomodoro: {
            estimatedPomodoros: 0,
            completedPomodoros: 0,
            isActive: false,
          },
        }),
      });

      setHasSetEstimate(false);
      setEstimatedPomodoros(1);
      setCompletedPomodoros(0);
      setIsRunning(false);
      setMode("pomodoro");
      setTimeLeft(durations.pomodoro);
    } catch (error) {
      console.error("Failed to reset pomodoro:", error);
    }
  };

  const completeCurrentSession = () => {
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const calculateFinishTime = () => {
    const remainingPomodoros = estimatedPomodoros - completedPomodoros;
    const pomodoroMinutes = remainingPomodoros * 25;
    const breakMinutes = (remainingPomodoros - 1) * 5 + Math.floor(remainingPomodoros / 4) * 10;
    const totalMinutes = pomodoroMinutes + breakMinutes;

    const finishTime = new Date();
    finishTime.setMinutes(finishTime.getMinutes() + totalMinutes);

    return {
      time: finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hours: (totalMinutes / 60).toFixed(1),
    };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏱️</div>
          <p className="text-purple-300 font-bold">Loading task...</p>
        </div>
      </main>
    );
  }

  if (!todo) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-purple-300 font-bold">Task not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const finishData = hasSetEstimate ? calculateFinishTime() : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-4 font-bold"
          >
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
            BACK TO MISSIONS
          </button>

          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            POMODORO SESSION
          </h1>
          <p className="text-purple-300 text-sm font-bold uppercase tracking-wider">
            Deep Focus Mode
          </p>
        </div>

        {/* Task Info */}
        <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 mb-8">
          <h2 className="text-2xl font-bold mb-2">{todo.title}</h2>
          {todo.description && (
            <p className="text-purple-200 text-sm">{todo.description}</p>
          )}
        </div>

        {!hasSetEstimate ? (
          // Estimation Setup
          <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-500/30">
            <h3 className="text-2xl font-black mb-6 text-center">
              HOW MANY POMODOROS?
            </h3>
            <p className="text-purple-300 text-center mb-6">
              Estimate how many 25-minute focus sessions you'll need
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setEstimatedPomodoros(Math.max(1, estimatedPomodoros - 1))}
                className="w-12 h-12 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl font-bold text-2xl transition-all border-2 border-purple-500/30"
              >
                -
              </button>

              <div className="text-6xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {estimatedPomodoros}
              </div>

              <button
                onClick={() => setEstimatedPomodoros(estimatedPomodoros + 1)}
                className="w-12 h-12 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl font-bold text-2xl transition-all border-2 border-purple-500/30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleSetEstimate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70"
            >
              START POMODORO SESSION
            </button>
          </div>
        ) : (
          // Timer Interface
          <div className="space-y-6">
            {/* Progress Info */}
            <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Pomos: {completedPomodoros}/{estimatedPomodoros}
                  </div>
                  {finishData && (
                    <p className="text-purple-300 text-sm">
                      Finish At: {finishData.time} ({finishData.hours}h)
                    </p>
                  )}
                </div>

                {/* Progress circles */}
                <div className="flex gap-2">
                  {Array.from({ length: estimatedPomodoros }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 ${
                        i < completedPomodoros
                          ? "bg-green-500 border-green-400"
                          : "border-purple-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Reset Estimate Button */}
              <button
                onClick={resetPomodoroEstimate}
                className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-purple-300 py-2 rounded-xl font-bold text-sm transition-all border-2 border-slate-600 hover:border-purple-500/50"
              >
                🔄 RESET ESTIMATE
              </button>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-1000 ease-out shadow-lg shadow-purple-500/50"
                    style={{ width: `${(completedPomodoros / estimatedPomodoros) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timer Card */}
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-500/30">
              {/* Mode Tabs */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => switchMode("pomodoro")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    mode === "pomodoro"
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-500/50"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  🍅 POMODORO
                </button>
                <button
                  onClick={() => switchMode("shortBreak")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    mode === "shortBreak"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl shadow-green-500/50"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  ☕ SHORT BREAK
                </button>
                <button
                  onClick={() => switchMode("longBreak")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    mode === "longBreak"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-500/50"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  🌙 LONG BREAK
                </button>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-8xl md:text-9xl font-black mb-4 bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-purple-300 font-bold uppercase tracking-wider">
                  {mode === "pomodoro" && "Focus Time"}
                  {mode === "shortBreak" && "Take a Short Break"}
                  {mode === "longBreak" && "Enjoy Your Long Break"}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="space-y-3">
                <div className="flex gap-4">
                  <button
                    onClick={toggleTimer}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-5 rounded-xl font-black text-xl transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:scale-[1.02]"
                  >
                    {isRunning ? "⏸️ PAUSE" : "▶️ START"}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-8 bg-slate-700/50 hover:bg-slate-600/50 text-white py-5 rounded-xl font-bold transition-all border-2 border-slate-600 hover:border-purple-500/50"
                  >
                    🔄 RESET
                  </button>
                </div>

                {/* Complete Current Session Button */}
                <button
                  onClick={completeCurrentSession}
                  disabled={timeLeft === 0}
                  className="w-full bg-gradient-to-r from-green-600/50 to-emerald-600/50 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold transition-all border-2 border-green-500/30 hover:border-green-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ✅ COMPLETE {mode === "pomodoro" ? "POMODORO" : "BREAK"} NOW
                </button>
              </div>
            </div>

            {/* Motivational Footer */}
            {completedPomodoros === estimatedPomodoros && (
              <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 backdrop-blur-sm rounded-3xl p-6 border-2 border-green-500/30 shadow-2xl shadow-green-500/20 text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-black text-green-400 mb-2">
                  MISSION ACCOMPLISHED!
                </h3>
                <p className="text-green-300">
                  You've completed all your pomodoros. Time to conquer the next challenge!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
