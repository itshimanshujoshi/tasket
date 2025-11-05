"use client";

import { useState, useEffect } from "react";

interface Todo {
  _id: string;
  title: string;
  description: string;
  completed?: boolean;
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("user");

  const fetchTodos = async () => {
    try {
      const response = await fetch(`/api/todos`);
      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.title.trim()) return;
    setLoading(true);

    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTodo, name: userName, completed: false }),
      });

      setNewTodo({ title: "", description: "" });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to save todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) return;
    setLoading(true);

    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTodo),
      });

      setEditingTodo(null);
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todoId }),
      });

      await fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
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
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <p className="text-slate-600 mt-2">Organize your day, one task at a time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side - Add/Edit Todo */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 sticky top-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                {editingTodo ? (
                  <>
                    <span className="text-2xl">✏️</span>
                    Edit Task
                  </>
                ) : (
                  <>
                    <span className="text-2xl">➕</span>
                    Add New Task
                  </>
                )}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Buy groceries"
                    value={editingTodo ? editingTodo.title : newTodo.title}
                    onChange={(e) =>
                      editingTodo
                        ? setEditingTodo({ ...editingTodo, title: e.target.value })
                        : setNewTodo({ ...newTodo, title: e.target.value })
                    }
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add more details..."
                    value={editingTodo ? editingTodo.description : newTodo.description}
                    onChange={(e) =>
                      editingTodo
                        ? setEditingTodo({ ...editingTodo, description: e.target.value })
                        : setNewTodo({ ...newTodo, description: e.target.value })
                    }
                    rows={4}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {editingTodo ? (
                  <div className="flex gap-3">
                    <button
                      onClick={updateTodo}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Task"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={addTodo}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Task"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Todo List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Your Tasks</h2>
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
                  {todos.length} {todos.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {todos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-slate-400 text-lg">No tasks yet</p>
                    <p className="text-slate-300 text-sm mt-2">Add your first task to get started!</p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo._id}
                      className={`group bg-gradient-to-r ${
                        todo.completed
                          ? "from-slate-50 to-slate-100"
                          : "from-white to-slate-50"
                      } border-2 ${
                        todo.completed ? "border-slate-200" : "border-slate-200"
                      } rounded-xl p-4 hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleComplete(todo)}
                          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            todo.completed
                              ? "bg-green-500 border-green-500"
                              : "border-slate-300 hover:border-blue-500"
                          }`}
                        >
                          {todo.completed && (
                            <svg
                              className="w-4 h-4 text-white"
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
                            className={`font-semibold text-lg ${
                              todo.completed
                                ? "line-through text-slate-400"
                                : "text-slate-800"
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p
                              className={`text-sm mt-1 ${
                                todo.completed ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(todo)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <svg
                              className="w-5 h-5 text-blue-600"
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
                          <button
                            onClick={() => deleteTodo(todo._id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <svg
                              className="w-5 h-5 text-red-600"
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
      </div>
    </main>
  );
}