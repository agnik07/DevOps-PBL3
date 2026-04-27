import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";

const badge = (status) => {
  const s = String(status || "pending").toLowerCase();
  const map = {
    pending: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    graded: "bg-indigo-100 text-indigo-700",
  };
  return map[s] || map.pending;
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", file: null });
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tasks");
        setTasks(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("deadline", form.deadline);
      if (form.file) payload.append("file", form.file);
      await api.post("/tasks", payload);
      toast.success("Task created");
      setForm({ title: "", description: "", deadline: "", file: null });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Task creation failed");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Tasks</h2>
      {user.role !== "student" && (
        <form onSubmit={createTask} className="mb-6 grid gap-2 rounded-xl bg-white p-4 shadow md:grid-cols-2">
          <input placeholder="Title" className="rounded border px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Deadline" type="date" className="rounded border px-3 py-2" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          <input placeholder="Description" className="rounded border px-3 py-2 md:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input type="file" className="rounded border px-3 py-2" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
          <button className="rounded bg-blue-600 px-4 py-2 text-white">Create Task</button>
        </form>
      )}
      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Deadline</th>
              <th className="p-2 text-left">Status</th>
              {user.role === "student" && <th className="p-2 text-left">Submitted</th>}
              {user.role === "student" && <th className="p-2 text-left">Marks</th>}
            </tr>
          </thead>
          <tbody>
            {!loading && tasks.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-2">{t.title}</td>
                <td className="p-2">{t.description}</td>
                <td className="p-2">{new Date(t.deadline).toLocaleDateString()}</td>
                <td className="p-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badge(t.status || "pending")}`}>
                    {String(t.status || "pending").toUpperCase()}
                  </span>
                </td>
                {user.role === "student" && <td className="p-2">{t.submittedAt ? new Date(t.submittedAt).toLocaleString() : "-"}</td>}
                {user.role === "student" && <td className="p-2">{t.status === "graded" ? (t.marks ?? "-") : "-"}</td>}
              </tr>
            ))}
            {loading && <tr><td className="p-4 text-slate-500" colSpan={user.role === "student" ? 6 : 4}>Loading tasks...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;
