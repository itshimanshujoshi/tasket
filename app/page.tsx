"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Todo {
  _id: string;
  title: string;
  description: string;
  completed?: boolean;
  created_at?: Date;
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTodos = async () => {
    try {
      const response = await fetch(`/api/todos`);
      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const activeTodoCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const completionRate =
    todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      setError("Task title is required!");
      return;
    }
    setLoading(true);

    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTodo,
          completed: false,
          created_at: new Date(),
        }),
      });

      setNewTodo({ title: "", description: "" });
      setError("");
      await fetchTodos();
    } catch (error) {
      console.error("Failed to save todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) {
      setError("Task title is required!");
      return;
    }
    setLoading(true);

    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTodo),
      });

      setEditingTodo(null);
      setError("");
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todoId: string) => {
    const result = await Swal.fire({
      title: "🗑️ DELETE MISSION?",
      text: "This action cannot be undone. The task will be permanently removed from your command center.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "YES, DELETE IT!",
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

    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todoId }),
    });

    await fetchTodos();
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });

      await fetchTodos();
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo({ ...todo });
    setError("");
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setError("");
  };

  const getMotivation = () => {
    if (todos.length === 0)
      return { text: "READY TO DOMINATE? 💪", color: "text-purple-400" };
    if (completionRate === 100)
      return {
        text: "PERFECT! YOU'RE UNSTOPPABLE! 🏆",
        color: "text-yellow-400",
      };
    if (completionRate >= 75)
      return {
        text: "CRUSHING IT! ALMOST THERE! 🔥",
        color: "text-orange-400",
      };
    if (completionRate >= 50)
      return {
        text: "SOLID PROGRESS! KEEP GOING! ⚡",
        color: "text-green-400",
      };
    if (completedCount > 0)
      return { text: "MOMENTUM BUILDING! 🚀", color: "text-blue-400" };
    return { text: "TIME TO EXECUTE! LET'S GO! 💥", color: "text-rose-400" };
  };

  const motivation = getMotivation();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className={`text-3xl font-black mb-2 ${motivation.color}`}>
                {motivation.text}
              </h2>
              <p className="text-purple-200 text-sm">
                {activeTodoCount} active tasks • {completedCount} completed •{" "}
                {completionRate}% done
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {completedCount}
                </div>
                <div className="text-xs text-purple-300 font-bold mt-1">
                  DONE
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {todos.length}
                </div>
                <div className="text-xs text-purple-300 font-bold mt-1">
                  TOTAL
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {todos.length > 0 && (
            <div className="mt-4">
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/30">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-1000 ease-out shadow-lg shadow-purple-500/50"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side - Add/Edit Todo */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-purple-500/30 sticky top-6">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                {editingTodo ? (
                  <>
                    <span className="text-3xl">✏️</span>
                    <div>
                      <div className="text-white">EDIT TASK</div>
                      <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                        Refine Your Mission
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">⚡</span>
                    <div>
                      <div className="text-white">NEW TASK</div>
                      <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                        Add To Your Arsenal
                      </div>
                    </div>
                  </>
                )}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                    Task Title<span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dominate the morning workout"
                    value={editingTodo ? editingTodo.title : newTodo.title}
                    onChange={(e) =>
                      editingTodo
                        ? setEditingTodo({
                            ...editingTodo,
                            title: e.target.value,
                          })
                        : setNewTodo({ ...newTodo, title: e.target.value })
                    }
                    className={`w-full bg-slate-900/50 border-2 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 ${
                      error
                        ? "border-red-500 focus:border-red-400"
                        : "border-purple-500/30 focus:border-purple-400"
                    } focus:shadow-lg focus:shadow-purple-500/20`}
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2 font-bold">
                      ⚠️ {error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add battle plan details..."
                    value={
                      editingTodo
                        ? editingTodo.description
                        : newTodo.description
                    }
                    onChange={(e) =>
                      editingTodo
                        ? setEditingTodo({
                            ...editingTodo,
                            description: e.target.value,
                          })
                        : setNewTodo({
                            ...newTodo,
                            description: e.target.value,
                          })
                    }
                    rows={4}
                    className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-all resize-none text-white placeholder-slate-500 focus:shadow-lg focus:shadow-purple-500/20"
                  />
                </div>

                {editingTodo ? (
                  <div className="flex gap-3">
                    <button
                      onClick={updateTodo}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "UPDATING..." : "UPDATE TASK"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 bg-slate-700/50 hover:bg-slate-600/50 text-white py-4 rounded-xl font-bold transition-all border-2 border-slate-600"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={addTodo}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "ADDING..." : "⚡ ADD TASK"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Todo List */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-purple-500/30">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">
                    YOUR MISSIONS
                  </h2>
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                    Execute With Precision
                  </p>
                </div>
                <a
                  href="/prioritized"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-xl shadow-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/70 flex items-center gap-2 hover:scale-105"
                >
                  <span className="text-xl">🎯</span>
                  AI BATTLE PLAN
                </a>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                {todos.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-7xl mb-6 animate-bounce">🚀</div>
                    <p className="text-purple-200 text-2xl font-bold mb-2">
                      MISSION LOG EMPTY
                    </p>
                    <p className="text-purple-300 text-sm">
                      Add your first task and start crushing goals!
                    </p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo._id}
                      className={`group bg-gradient-to-r ${
                        todo.completed
                          ? "from-green-900/20 to-green-800/20 border-green-500/30"
                          : "from-slate-800/80 to-slate-700/80 border-purple-500/30"
                      } border-2 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-200`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleComplete(todo)}
                          className={`mt-1 w-8 h-8 rounded-xl border-3 flex items-center justify-center transition-all shadow-lg ${
                            todo.completed
                              ? "bg-green-500 border-green-400 shadow-green-500/50"
                              : "border-purple-400 hover:border-purple-300 hover:bg-purple-500/20 shadow-purple-500/30"
                          }`}
                        >
                          {todo.completed && (
                            <svg
                              className="w-5 h-5 text-white font-bold"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-lg ${
                              todo.completed
                                ? "line-through text-green-300/50"
                                : "text-white group-hover:text-purple-200"
                            } transition-colors`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p
                              className={`text-sm mt-2 leading-relaxed ${
                                todo.completed
                                  ? "text-green-300/40 line-through"
                                  : "text-purple-200"
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!todo.completed && (
                            <button
                              onClick={() => startEdit(todo)}
                              className="p-2 hover:bg-blue-500/20 rounded-xl transition-all border-2 border-transparent hover:border-blue-500/50"
                              title="Edit task"
                            >
                              <svg
                                className="w-5 h-5 text-blue-400"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() => deleteTodo(todo._id)}
                            className="p-2 hover:bg-red-500/20 rounded-xl transition-all border-2 border-transparent hover:border-red-500/50"
                            title="Delete task"
                          >
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Power Message */}
        <div className="mt-8 text-center">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
            💪 DISCIPLINE EQUALS FREEDOM • 🎯 EXECUTE DAILY • 🔥 NO EXCUSES
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </main>
  );
}
