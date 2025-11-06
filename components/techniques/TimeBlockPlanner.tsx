"use client";

import { useState } from "react";

export default function TimeBlockPlanner() {
  const [blocks, setBlocks] = useState([{ time: "09:00", task: "" }]);

  const addBlock = () =>
    setBlocks([...blocks, { time: "", task: "" }]);

  const updateBlock = (i: number, key: string, value: string) => {
    const copy = [...blocks];
    (copy[i] as any)[key] = value;
    setBlocks(copy);
  };

  return (
    <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">Time Block Planner</h3>
      <div className="space-y-3">
        {blocks.map((b, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              type="time"
              value={b.time}
              onChange={(e) => updateBlock(i, "time", e.target.value)}
              className="border border-pink-300 rounded-lg px-2 py-1"
            />
            <input
              type="text"
              value={b.task}
              onChange={(e) => updateBlock(i, "task", e.target.value)}
              placeholder="Task description..."
              className="flex-1 border border-pink-300 rounded-lg px-3 py-1"
            />
          </div>
        ))}
      </div>
      <button
        onClick={addBlock}
        className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
      >
        + Add Block
      </button>
    </div>
  );
}
