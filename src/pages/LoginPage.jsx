import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { supabase } from '../lib/supabase';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('Invalid email or password');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar isPublic />
      <div className="auth-page">
        <div className="auth-card card">
          <div className="auth-header">
            <h2 className="bebas" style={{ fontSize: 32, color: 'var(--primary)' }}>Welcome Back</h2>
            <p className="text-sm text-muted">Sign in to continue your training</p>
          </div>
          <div className="input-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jacob@example.com"
            />
          </div>
          <div className="input-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="forgot-link"><span>Forgot password?</span></div>
          {error && (
            <div className="text-sm" style={{ color: 'var(--error)', marginBottom: 8 }}>
              ⚠ {error}
            </div>
          )}
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>
          <div className="divider">or</div>
          <button className="btn btn-outline btn-block" style={{ marginBottom: 16 }}>
            Continue with Google
          </button>
          <p className="auth-switch text-sm text-muted">
            No account? <span className="auth-link" onClick={() => navigate('/register')}>Register →</span>
          </p>
        </div>
      </div>
    </>
  );
}