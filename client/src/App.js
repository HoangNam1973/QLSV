import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import CourseManagement from './pages/CourseManagement';
import ClassManagement from './pages/ClassManagement';
import GradeManagement from './pages/GradeManagement';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Đang tải...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user, loading } = useAuth();
  console.log('user:', user, 'loading:', loading);

  return (
    <div className="h-screen flex">
      {user && <Sidebar />}
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:maSV"
            element={
              <ProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:maLop"
            element={
              <ProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <GradeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
