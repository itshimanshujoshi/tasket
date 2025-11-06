"use client";

export default function EisenhowerMatrix() {
  const quadrants = [
    { title: "Urgent & Important", color: "red-400" },
    { title: "Important, Not Urgent", color: "blue-400" },
    { title: "Urgent, Not Important", color: "yellow-400" },
    { title: "Not Urgent, Not Important", color: "gray-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {quadrants.map((q, i) => (
        <div
          key={i}
          className={`border border-${q.color} bg-${q.color}/10 rounded-lg p-4`}
        >
          <h3 className="font-semibold mb-2">{q.title}</h3>
          <textarea
            placeholder="Add tasks..."
            className="w-full h-24 p-2 border border-slate-300 rounded-md resize-none"
          ></textarea>
        </div>
      ))}
    </div>
  );
}
