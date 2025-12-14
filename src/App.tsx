import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import DentistDashboard from './pages/dentist/DentistDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onToggleForm={() => setShowRegister(false)} />
    ) : (
      <Login onToggleForm={() => setShowRegister(true)} />
    );
  }

  if (user.role === 'patient') {
    return <PatientDashboard />;
  }

  if (user.role === 'dentist') {
    return <DentistDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600">Invalid user role</p>
    </div>
  );
}

export default App;
