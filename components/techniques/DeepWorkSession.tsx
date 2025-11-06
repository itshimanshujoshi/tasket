"use client";

import { useState, useEffect } from "react";

export default function DeepWorkSession() {
  const [time, setTime] = useState(90 * 60);
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

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center shadow-md">
      <h3 className="text-xl font-semibold mb-2">Deep Work Session</h3>
      <p className="text-4xl font-bold text-purple-700 mb-4">
        {formatTime(time)}
      </p>
      <button
        onClick={() => setIsActive(!isActive)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        {isActive ? "Pause" : "Start Session"}
      </button>
    </div>
  );
}
