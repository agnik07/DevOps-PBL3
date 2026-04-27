import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/useAuth";

const AttendancePage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState({ studentId: "", status: "present" });
  const [requestWord, setRequestWord] = useState("");

  const load = async () => {
    if (user.role === "teacher") {
      const [attendance, list] = await Promise.all([api.get("/attendance/all"), api.get("/users?page=1&limit=200")]);
      setRows(attendance.data || []);
      setStudents(list.data.data || []);
    } else {
      const res = await api.get("/attendance/student/me");
      setRows(res.data || []);
    }
  };

  useEffect(() => {
    (async () => {
      if (user.role === "teacher") {
        const [attendance, list] = await Promise.all([api.get("/attendance/all"), api.get("/users?page=1&limit=200")]);
        setRows(attendance.data || []);
        setStudents(list.data.data || []);
      } else {
        const res = await api.get("/attendance/student/me");
        setRows(res.data || []);
      }
    })();
  }, [user.role]);

  const request = async () => {
    if (requestWord !== "ATTENDED") return;
    await api.post("/attendance/request");
    setRequestWord("");
    load();
  };

  const mark = async (e) => {
    e.preventDefault();
    await api.post("/attendance/mark", selected);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Attendance</h2>
      {user.role === "student" ? (
        <div className="rounded bg-white p-4 shadow">
          <p className="mb-2 text-sm">Type `ATTENDED` and submit attendance request.</p>
          <div className="flex gap-2">
            <input className="rounded border px-3 py-2" value={requestWord} onChange={(e) => setRequestWord(e.target.value)} />
            <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={request}>Request</button>
          </div>
        </div>
      ) : (
        <form onSubmit={mark} className="grid gap-2 rounded bg-white p-4 shadow md:grid-cols-3">
          <select className="rounded border px-3 py-2" value={selected.studentId} onChange={(e) => setSelected({ ...selected, studentId: e.target.value })} required>
            <option value="">Select student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.email})</option>)}
          </select>
          <select className="rounded border px-3 py-2" value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <button className="rounded bg-blue-600 px-4 py-2 text-white">Mark</button>
        </form>
      )}
      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-2 text-left">Student</th><th className="p-2 text-left">Date</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Requested</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => <tr key={r._id} className="border-t"><td className="p-2">{r.studentId?.name || user.name}</td><td className="p-2">{new Date(r.date).toLocaleDateString()}</td><td className="p-2 capitalize">{r.status}</td><td className="p-2">{r.requestedByStudent ? "Yes" : "No"}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
