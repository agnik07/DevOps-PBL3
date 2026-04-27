import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SpinnerButton from "../components/SpinnerButton";
import { useAuth } from "../context/useAuth";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState("student");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", rollNo: "", className: "" });
  const [error, setError] = useState("");

  const validate = () => {
    if (!form.email || !form.password || (!isLogin && !form.name)) return "All required fields must be filled";
    if (!isLogin && selectedRole === "student" && (!form.rollNo || !form.className)) {
      return "Roll no and class are required for student registration";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setError("");
      const payload = { ...form, role: selectedRole };
      const user = isLogin
        ? await login(payload)
        : await register(payload);
      toast.success(isLogin ? "Login successful" : "Registration successful");
      const path = user.role === "student" ? "/student-dashboard" : "/dashboard";
      navigate(path);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Authentication failed");
    }
  };

  const roles = [
    { id: "student", title: "Student Login", icon: "👨‍🎓", desc: "Access tasks, submissions, attendance" },
    { id: "teacher", title: "Teacher Login", icon: "👨‍🏫", desc: "Manage students, attendance and reports" }
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className={`group cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-2xl ${selectedRole === role.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`} onClick={() => setSelectedRole(role.id)}>
              <div className="text-3xl mb-3">{role.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{role.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl md:ml-4">
          <h2 className="mb-1 text-2xl font-bold">{isLogin ? "Sign In" : "Sign Up"} as <span className="capitalize text-blue-600">{selectedRole}</span></h2>
          <p className="mb-6 text-sm text-slate-500">Academic Management System</p>
          {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</p>}
          <div className="flex gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-lg px-4 py-2 font-medium ${isLogin ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-lg px-4 py-2 font-medium ${!isLogin ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                <input 
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  placeholder="John Doe"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
              <input 
                type="email" 
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="student@university.edu"
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
              <input 
                type="password" 
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="At least 6 characters"
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
              />
            </div>
            {!isLogin && selectedRole === "student" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Roll No</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="STU001"
                    value={form.rollNo}
                    onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Class Name</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="BCA-A"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                  />
                </div>
              </>
            )}
            <SpinnerButton type="submit" loading={loading} label={isLogin ? "Sign In" : "Sign Up"} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
