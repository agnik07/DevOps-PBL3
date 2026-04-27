import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";
import api from "../api/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/reports/dashboard");
      setStats(data);
    };
    load();
  }, []);

  const title = user?.role === "student" ? "Student Dashboard" : "Teacher Dashboard";
  const isTeacher = user?.role === "teacher";
  const chartData = isTeacher
    ? [
        { key: "Students", value: stats?.totalStudents || 0 },
        { key: "Tasks", value: stats?.tasksAssigned || 0 },
        { key: "Pending", value: stats?.submissionsPending || 0 },
      ]
    : [
        { key: "Pending", value: stats?.pendingTasks || 0 },
        { key: "Completed", value: stats?.completedTasks || 0 },
        { key: "Attendance", value: stats?.attendancePercent || 0 },
      ];

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">Welcome, {user?.name}</div>
        <div className="rounded-lg bg-white p-4 shadow capitalize">Role: {user?.role}</div>
        <div className="rounded-lg bg-white p-4 shadow">{user?.rollNo ? `Roll No: ${user.rollNo}` : `Class: ${user?.className || "-"}`}</div>
      </div>

      {!isTeacher && (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Pending Tasks</p><p className="text-2xl font-bold">{stats?.pendingTasks ?? "-"}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Completed Tasks</p><p className="text-2xl font-bold">{stats?.completedTasks ?? "-"}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Attendance %</p><p className="text-2xl font-bold">{stats?.attendancePercent ?? "-"}%</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Average Marks</p><p className="text-2xl font-bold">{stats?.marksAverage ?? "-"}</p></div>
        </div>
      )}

      {isTeacher && (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Total Students</p><p className="text-2xl font-bold">{stats?.totalStudents ?? "-"}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Tasks Assigned</p><p className="text-2xl font-bold">{stats?.tasksAssigned ?? "-"}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Pending Submissions</p><p className="text-2xl font-bold">{stats?.submissionsPending ?? "-"}</p></div>
          <div className="rounded-lg bg-white p-4 shadow"><p className="text-sm text-slate-500">Average Class Score</p><p className="text-2xl font-bold">{stats?.averageMarks ?? "-"}</p></div>
        </div>
      )}
      <div className="mt-6 h-72 rounded-lg bg-white p-4 shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="key" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
