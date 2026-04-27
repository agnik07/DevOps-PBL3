import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import { downloadFile } from "../utils/download";
import { useAuth } from "../context/useAuth";

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [myReport, setMyReport] = useState(null);
  const [all, setAll] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === "student") {
          const res = await api.get("/reports/student/me");
          setMyReport(res.data);
        } else {
          const res = await api.get("/reports/all-students");
          setAll(res.data || []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.role]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Reports</h2>
      <p className="mb-4 text-sm text-slate-600">
        {user.role === "student" ? "Download your own reports" : "Download institution-wide reports"}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {user.role === "student" && <button className="rounded bg-blue-600 p-3 text-white" onClick={() => downloadFile(`/reports/student/me/pdf`, "my-report.pdf")}>Download Personal PDF</button>}
        {user.role === "teacher" && <button className="rounded bg-blue-600 p-3 text-white" onClick={() => downloadFile("/reports/all/pdf", "all-students.pdf")}>Download All Students PDF</button>}
        {user.role === "teacher" && <button className="rounded bg-emerald-600 p-3 text-white" onClick={() => downloadFile("/reports/all/csv", "all-students.csv")}>Download CSV</button>}
        {user.role === "teacher" && <button className="rounded bg-indigo-600 p-3 text-white" onClick={() => downloadFile("/reports/all/excel", "all-students.xlsx")}>Download Excel</button>}
      </div>
      {loading && <div className="mt-4 rounded bg-white p-4 text-sm text-slate-600 shadow">Loading report data...</div>}

      {user.role === "student" && myReport && (
        <div className="mt-6 space-y-3">
          <div className="rounded bg-white p-4 shadow">
            <h3 className="mb-1 text-lg font-semibold">{myReport.student.name}</h3>
            <p className="text-sm text-slate-600">{myReport.student.email} • Roll {myReport.student.rollNo || "-"} • {myReport.student.className || "-"}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <div className="rounded bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Attendance</p>
                <p className="text-lg font-semibold">{myReport.attendance.percentage}%</p>
              </div>
              <div className="rounded bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Present / Absent</p>
                <p className="text-lg font-semibold">{myReport.attendance.presentDays}/{myReport.attendance.absentDays}</p>
              </div>
              <div className="rounded bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Submitted</p>
                <p className="text-lg font-semibold">{myReport.summary.tasksSubmitted}</p>
              </div>
              <div className="rounded bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Average (graded)</p>
                <p className="text-lg font-semibold">{myReport.summary.averageMarks}</p>
              </div>
            </div>
          </div>

          <div className="rounded bg-white p-4 shadow">
            <h4 className="mb-2 font-semibold">Submissions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2 text-left">Task</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Marks</th>
                    <th className="p-2 text-left">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {myReport.submissions.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.task?.title || "-"}</td>
                      <td className="p-2 capitalize">{s.status}</td>
                      <td className="p-2">{s.marks ?? "-"}</td>
                      <td className="p-2">{s.feedback || "-"}</td>
                    </tr>
                  ))}
                  {!myReport.submissions.length && <tr><td className="p-3 text-slate-500" colSpan={4}>No submissions yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {user.role === "teacher" && !!all.length && (
        <div className="mt-6 overflow-x-auto rounded bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Roll</th>
                <th className="p-2 text-left">Class</th>
                <th className="p-2 text-left">Attendance %</th>
                <th className="p-2 text-left">Present/Absent</th>
                <th className="p-2 text-left">Submitted</th>
                <th className="p-2 text-left">Graded</th>
                <th className="p-2 text-left">Avg</th>
              </tr>
            </thead>
            <tbody>
              {all.map((r) => (
                <tr key={r.student.id} className="border-t">
                  <td className="p-2">{r.student.name}</td>
                  <td className="p-2">{r.student.email}</td>
                  <td className="p-2">{r.student.rollNo || "-"}</td>
                  <td className="p-2">{r.student.className || "-"}</td>
                  <td className="p-2">{r.attendance.percentage}%</td>
                  <td className="p-2">{r.attendance.presentDays}/{r.attendance.absentDays}</td>
                  <td className="p-2">{r.summary.tasksSubmitted}</td>
                  <td className="p-2">{r.summary.tasksGraded}</td>
                  <td className="p-2">{r.summary.averageMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
