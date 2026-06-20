import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { supabase } from '../lib/supabase';
import './AuthPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          age: age,
          city: city
        }
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <>
      <Navbar isPublic />
      <div className="auth-page">
        <form className="auth-card card" style={{ maxWidth: 520 }} onSubmit={handleSubmit}>
          <div className="auth-header">
            <h2 className="bebas" style={{ fontSize: 32, color: 'var(--primary)' }}>Join the Mission</h2>
            <p className="text-sm text-muted">Create your account to start training</p>
          </div>
          <div className="grid2">
            <div className="input-group"><label className="label">First Name</label><input className="input" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" /></div>
            <div className="input-group"><label className="label">Last Name</label><input className="input" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" /></div>
          </div>
          <div className="input-group"><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          <div className="input-group"><label className="label">Password</label><input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" /></div>
          <div className="grid2">
            <div className="input-group"><label className="label">Age</label><input className="input" type="number" required value={age} onChange={e => setAge(e.target.value)} placeholder="18" /></div>
            <div className="input-group"><label className="label">City</label><input className="input" required value={city} onChange={e => setCity(e.target.value)} placeholder="Your city" /></div>
          </div>
          {error && (
            <div className="text-sm" style={{ color:'var(--error)', marginBottom: 8 }}>
              ⚠ {error}
            </div>
          )}
          <button type="submit" className="btn btn-accent btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
          <p className="auth-switch text-sm text-muted" style={{ marginTop: 16 }}>
            Already registered? <span className="auth-link" onClick={() => navigate('/login')}>Log In →</span>
          </p>
        </form>
      </div>
    </>
  );
}