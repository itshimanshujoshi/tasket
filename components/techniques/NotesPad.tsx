"use client";

import { useState } from "react";

export default function NotesPad() {
  const [note, setNote] = useState("");

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-2">Notes Pad</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your insights, summaries, or next steps..."
        className="w-full h-40 border border-yellow-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none bg-white"
      ></textarea>
    </div>
  );
}
