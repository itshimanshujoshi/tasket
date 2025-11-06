"use client";

import { useState, useEffect } from "react";

export default function PomodoroTimer() {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isActive) {
      timer = setInterval(() => {
        setTime((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const reset = () => setTime(25 * 60);

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 text-center shadow-md">
      <h3 className="text-xl font-semibold mb-2">Pomodoro Timer</h3>
      <div className="text-4xl font-bold mb-4 text-indigo-700">
        {formatTime(time)}
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={toggleTimer}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="border border-indigo-300 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
