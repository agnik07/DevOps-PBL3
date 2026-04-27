import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Submissions from "./pages/Submissions";
import Marks from "./pages/Marks";
import Reports from "./pages/Reports";
import StudentsPage from "./pages/StudentsPage";
import AttendancePage from "./pages/AttendancePage";

const App = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={["teacher"]} />}>
      <Route element={<AppLayout />}>
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance-management" element={<AttendancePage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/auth" replace />} />
  </Routes>
);

export default App;
