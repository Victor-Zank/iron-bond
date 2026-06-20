import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';

import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import WorkoutPage     from './pages/WorkoutPage';
import ValuesPage      from './pages/ValuesPage';
import TeamPage        from './pages/TeamPage';
import GiyusPage       from './pages/GiyusPage';
import ProfilePage     from './pages/ProfilePage';
import CampPage        from './pages/CampPage';
import PaymentPage     from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        {/* Public */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />

        {/* Member (protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="/workout"     element={<WorkoutPage />} />
          <Route path="/values"      element={<ValuesPage />} />
          <Route path="/team"        element={<TeamPage />} />
          <Route path="/giyus"       element={<GiyusPage />} />
          <Route path="/profile"     element={<ProfilePage />} />
          <Route path="/camp"        element={<CampPage />} />
          <Route path="/payment"     element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
