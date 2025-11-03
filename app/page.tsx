"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [todos, setTodos] = useState<
    { _id?: String; title: string; description: string }[]
  >([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const addTodo = async () => {
    if (!newTodo.title.trim()) return;
    const todo = { ...newTodo };
    setLoading(true);

    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });

      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setNewTodo({ title: "", description: "" });
    } catch {
      console.error("Failed to save todo.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (index: number, todo_id: string) => {
    setTodos(todos.filter((_, i) => i !== index));

    try {
      await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todo_id }),
      });
    } catch {
      console.error("Failed to delete todo.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">Hey 👋</h1>

        {/* Add Todo */}
        <div className="bg-card-bg border border-border rounded-lg p-4 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-3">Add a new task</h2>
          <input
            type="text"
            placeholder="Task title"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTodo.description}
            onChange={(e) =>
              setNewTodo({ ...newTodo, description: e.target.value })
            }
            className="w-full border border-border rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={addTodo}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded-lg transition"
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-muted text-center">No tasks yet. Add one!</p>
          ) : (
            todos.map((todo, index) => (
              <div
                key={index}
                className="bg-card-bg border border-border rounded-lg p-4 flex justify-between items-start shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-lg">{todo.title}</h3>
                  {todo.description && (
                    <p className="text-muted text-sm mt-1">
                      {todo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteTodo(index, todo._id)}
                  className="text-muted hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
