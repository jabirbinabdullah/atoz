"use client";
import { useEffect, useState } from "react";

// Simple Todo type used both in the client and server handlers.
type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const LOCAL_STORAGE_KEY = "atoz:todos";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos from the server API. Server is considered the
  // authoritative source for the current dev session.
  async function fetchTodos() {
    setLoading(true);
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(data || []);
      // Persist server result to localStorage so the client has a
      // persistent copy across browser reloads.
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data || []));
      } catch {
        // ignore localStorage errors (e.g., private mode)
      }
    } finally {
      setLoading(false);
    }
  }

  // On mount: load cached todos from localStorage for instant UI,
  // then fetch the server to reconcile.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setTodos(JSON.parse(cached));
      }
    } catch {
      // ignore parse errors
    }
    // Fetch server list in background to get the canonical state.
    fetchTodos();
  }, []);

  // Persist to localStorage whenever todos change so the client
  // remembers them across browser reloads (even if the dev server
  // is stopped). This makes dev iterations more convenient.
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // ignore localStorage errors
    }
  }, [todos]);

  // Add a todo: optimistic update to UI + persist locally, then POST to API.
  async function addTodo(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    const optimistic: Todo = { id: Date.now().toString(), text: text.trim(), completed: false };
    const prev = todos;
    setTodos((t) => [optimistic, ...t]);
    setText("");
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: optimistic.text }),
      });
      if (!res.ok) throw new Error("create failed");
      const created = await res.json();
      // Replace optimistic id with server id (if different).
      setTodos((t) => t.map((x) => (x.id === optimistic.id ? created : x)));
    } catch (err) {
      console.error("Failed to create todo", err);
      // revert optimistic change
      setTodos(prev);
      setError("Failed to create todo");
      window.setTimeout(() => setError(null), 5000);
    }
  }

  // Toggle completion: optimistic update then send PUT to server.
  async function toggle(todo: Todo) {
    const prev = todos;
    const toggled = { ...todo, completed: !todo.completed };
    setTodos((t) => t.map((x) => (x.id === todo.id ? toggled : x)));
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: toggled.completed }),
      });
      if (!res.ok) throw new Error("toggle failed");
    } catch (err) {
      console.error("Failed to toggle todo", err);
      setTodos(prev);
      setError("Failed to update todo");
      window.setTimeout(() => setError(null), 5000);
    }
  }

  // Remove: optimistic update then call DELETE on the API.
  async function remove(id: string) {
    const prev = todos;
    setTodos((t) => t.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch (err) {
      console.error("Failed to delete todo", err);
      setTodos(prev);
      setError("Failed to delete todo");
      window.setTimeout(() => setError(null), 5000);
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded bg-red-100 px-3 py-2 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={addTodo} className="mb-4 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo"
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Add
        </button>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : todos.length === 0 ? (
        <div className="text-zinc-600">No todos yet — add one above.</div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggle(todo)}
                />
                <span className={"select-none " + (todo.completed ? "line-through text-zinc-500" : "")}>{todo.text}</span>
              </label>
              <div>
                <button
                  onClick={() => remove(todo.id)}
                  className="rounded bg-red-500 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
