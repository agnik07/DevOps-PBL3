import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";

const Marks = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ studentId: "", subject: "", score: "", remarks: "" });
  const [students, setStudents] = useState([]);

  const fetchMarks = async () => {
    if (user.role === "student") {
      const res = await api.get("/marks/my");
      setReport(res.data);
      setRows([]);
      return;
    }
    const id = form.studentId || "me";
    const res = await api.get(`/marks/student/${id}`);
    setRows(res.data || []);
  };

  useEffect(() => {
    (async () => {
      if (user.role === "student") {
        const res = await api.get("/marks/my");
        setReport(res.data);
        setRows([]);
        return;
      }
      const id = form.studentId || "me";
      const res = await api.get(`/marks/student/${id}`);
      setRows(res.data || []);
    })();
  }, [user.role, form.studentId]);

  useEffect(() => {
    if (user.role === "student") return;
    const fetchStudents = async () => {
      const res = await api.get("/users?page=1&limit=100");
      setStudents(res.data.data || []);
    };
    fetchStudents();
  }, [user.role]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post("/marks", { ...form, score: Number(form.score) });
      toast.success("Marks saved");
      setForm({ studentId: "", subject: "", score: "", remarks: "" });
      fetchMarks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save marks");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Marks</h2>
      {user.role === "student" && (
        <div className="space-y-3">
          <div className="rounded bg-white p-4 shadow">
            <p className="text-sm text-slate-600">Overall average: <span className="font-semibold">{report?.summary?.overallAverage ?? 0}</span></p>
            <p className="text-sm text-slate-600">Graded tasks: <span className="font-semibold">{report?.summary?.gradedCount ?? 0}</span></p>
          </div>
          {(report?.subjects || []).map((s) => (
            <div key={s.subject} className="rounded bg-white p-4 shadow">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{s.subject}</h3>
                <p className="text-sm text-slate-600">Total {s.total} • Avg {s.average}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Task</th>
                      <th className="p-2 text-left">Marks</th>
                      <th className="p-2 text-left">Feedback</th>
                      <th className="p-2 text-left">Graded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.items.map((it) => (
                      <tr key={it.submissionId} className="border-t">
                        <td className="p-2">{it.taskTitle}</td>
                        <td className="p-2">{it.marks ?? "-"}</td>
                        <td className="p-2">{it.feedback || "-"}</td>
                        <td className="p-2">{it.gradedAt ? new Date(it.gradedAt).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))}
                    {!s.items.length && (
                      <tr><td className="p-3 text-slate-500" colSpan={4}>No graded tasks</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {!report?.subjects?.length && (
            <div className="rounded bg-white p-4 text-sm text-slate-600 shadow">No graded marks yet.</div>
          )}
        </div>
      )}
      {user.role !== "student" && (
        <form onSubmit={save} className="mb-6 grid gap-2 rounded bg-white p-4 shadow md:grid-cols-5">
          <select className="rounded border px-3 py-2" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.studentId || s.email})</option>
            ))}
          </select>
          <input placeholder="Subject" className="rounded border px-3 py-2" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <input placeholder="Score" type="number" className="rounded border px-3 py-2" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
          <input placeholder="Remarks" className="rounded border px-3 py-2" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
        </form>
      )}
      {user.role !== "student" && (
        <div className="overflow-x-auto rounded bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100"><tr><th className="p-2 text-left">Subject</th><th className="p-2 text-left">Score</th><th className="p-2 text-left">Remarks</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r._id} className="border-t"><td className="p-2">{r.subject}</td><td className="p-2">{r.score}</td><td className="p-2">{r.remarks || "-"}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Marks;
