"use client";

import { useState } from "react";

export default function FocusTracker() {
  const [sessions, setSessions] = useState<number>(0);

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center shadow-md">
      <h3 className="text-xl font-semibold mb-2">Focus Tracker</h3>
      <p className="text-4xl font-bold text-green-700 mb-4">{sessions}</p>
      <button
        onClick={() => setSessions(sessions + 1)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        + Add Session
      </button>
    </div>
  );
}
