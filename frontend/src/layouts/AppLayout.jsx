import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const links = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/tasks", label: "Tasks" },
      { to: "/submissions", label: "Submissions" }
  ];
  if (user.role === "teacher") {
    links.push(
      { to: "/students", label: "Students" },
      { to: "/attendance-management", label: "Attendance" },
      { to: "/marks", label: "Marks" },
      { to: "/reports", label: "Reports" },
    );
  } else {
    links.push({ to: "/attendance", label: "Attendance" }, { to: "/marks", label: "Marks" }, { to: "/reports", label: "Reports" });
  }

  return (
    <div className={`min-h-screen md:flex ${dark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      <button className="m-3 rounded bg-slate-900 px-3 py-2 text-white md:hidden" onClick={() => setOpen((s) => !s)}>Menu</button>
      <aside className={`${open ? "block" : "hidden"} bg-slate-900 p-4 text-white md:block md:w-64 md:min-h-screen`}>
        <h1 className="mb-2 text-xl font-bold">Academic System</h1>
        <p className="mb-6 text-xs text-slate-300">Teacher / Student Portal</p>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${isActive ? "bg-blue-600" : "hover:bg-slate-800"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-slate-700 pt-4 text-sm">
          <p>{user?.name} {user.rollNo && `(${user.rollNo})`}</p>
          <p className="mb-3 text-slate-300 capitalize">{user.role} - {user.className || "No class"}</p>
          <button onClick={logout} className="rounded bg-red-600 px-3 py-1 hover:bg-red-700">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4 flex justify-end">
          <button className="rounded border px-3 py-1" onClick={() => setDark((s) => !s)}>{dark ? "Light Mode" : "Dark Mode"}</button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
