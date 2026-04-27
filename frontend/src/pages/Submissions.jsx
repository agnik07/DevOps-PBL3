import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";

const Submissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({ taskId: "", textAnswer: "", file: null });
  const [gradeMap, setGradeMap] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tRes = await api.get("/tasks");
      setTasks(tRes.data || []);
      if (user.role === "teacher") {
        const sRes = await api.get("/submissions/teacher");
        setSubmissions(sRes.data || []);
      } else {
        const sRes = await api.get("/submissions/my");
        setSubmissions(sRes.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const tRes = await api.get("/tasks");
        setTasks(tRes.data || []);
        if (user.role === "teacher") {
          const sRes = await api.get("/submissions/teacher");
          setSubmissions(sRes.data || []);
        } else {
          const sRes = await api.get("/submissions/my");
          setSubmissions(sRes.data || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user.role]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("textAnswer", form.textAnswer);
      if (form.file) payload.append("file", form.file);
      await api.post(`/submissions/${form.taskId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Submission saved");
      setForm({ taskId: "", textAnswer: "", file: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  const grade = async (id) => {
    const entry = gradeMap[id] || {};
    try {
      await api.put(`/submissions/${id}/grade`, {
        marks: entry.marks === "" || entry.marks === undefined ? null : Number(entry.marks),
        feedback: entry.feedback || "",
        status: entry.status || "approved",
      });
      toast.success("Submission updated");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return <div>
    <h2 className="mb-4 text-xl font-bold">Submissions</h2>
    {user.role === "student" && (
      <form onSubmit={submit} className="mb-6 grid gap-2 rounded bg-white p-4 shadow md:grid-cols-2">
        <select className="rounded border px-3 py-2" value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} required>
          <option value="">Select task</option>
          {tasks.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
        </select>
        <input type="file" className="rounded border px-3 py-2" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
        <input placeholder="Submission text" className="rounded border px-3 py-2 md:col-span-2" value={form.textAnswer} onChange={(e) => setForm({ ...form, textAnswer: e.target.value })} required />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Submit Task</button>
      </form>
    )}
    <div className="space-y-3">
      {loading && <div className="rounded bg-white p-4 text-sm text-slate-600 shadow">Loading submissions...</div>}
      {submissions.map((s) => <div key={s._id} className="rounded bg-white p-4 shadow">
        <p className="font-semibold">{s.taskId?.title} - <span className="capitalize">{s.status}</span></p>
        {user.role === "teacher" && (
          <p className="text-sm">Student: {s.studentId?.name} ({s.studentId?.rollNo || s.studentId?.email})</p>
        )}
        <p className="text-sm text-slate-600">Submitted: {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-"}</p>
        {s.file && <p className="text-sm"><a className="text-blue-600 underline" href={`${import.meta.env.VITE_API_URL}${s.file}`} target="_blank" rel="noreferrer">Download uploaded file</a></p>}
        <p className="text-sm">Marks: {s.marks ?? "-"} | Feedback: {s.feedback || "-"}</p>
        {user.role !== "student" && <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input type="number" placeholder="Marks" className="rounded border px-2 py-1" onChange={(e) => setGradeMap({ ...gradeMap, [s._id]: { ...(gradeMap[s._id] || {}), marks: e.target.value } })} />
          <input placeholder="Feedback" className="rounded border px-2 py-1" onChange={(e) => setGradeMap({ ...gradeMap, [s._id]: { ...(gradeMap[s._id] || {}), feedback: e.target.value } })} />
          <select className="rounded border px-2 py-1" onChange={(e) => setGradeMap({ ...gradeMap, [s._id]: { ...(gradeMap[s._id] || {}), status: e.target.value } })}>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
            <option value="graded">Graded</option>
          </select>
          <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => grade(s._id)}>Save</button>
        </div>}
      </div>)}
    </div>
  </div>;
};

export default Submissions;
