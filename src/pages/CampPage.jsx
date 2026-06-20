import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './CampPage.css';

const included = [
  '7 days of combat-style training',
  'Cultural workshops & heritage tours',
  'IDF veteran mentors',
  'Giyus paperwork guidance sessions',
  'Team bonding & community events',
  'Accommodation & meals included',
];

export default function CampPage() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, loading: authLoading } = useAuth();
  const [camp, setCamp] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    age: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    health_declaration: false,
  });

  useEffect(() => {
    async function fetchData() {
      // Use auth context for user
      const userCtx = authUser;
      setUser(userCtx);

      // Pre-fill name from user metadata
      if (userCtx?.user_metadata?.full_name) {
        setForm(f => ({ ...f, full_name: userCtx.user_metadata.full_name }));
      }

      // Fetch camp details from Supabase
      const { data, error } = await supabase
        .from('camps')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(1)
        .single();

      if (!error) setCamp(data);
      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit() {
    if (!form.health_declaration) {
      setError('Please confirm the health declaration.');
      return;
    }
    if (!form.full_name || !form.emergency_contact_name) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error } = await supabase
      .from('registrations')
      .insert({
        user_id: user.id,
        camp_id: camp.id,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        health_declaration: form.health_declaration,
      });

    if (error) {
      setError('Registration failed. Please try again.');
      setSubmitting(false);
    } else {
      navigate('/payment');
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
          <Spinner />
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">{camp?.name || 'Summer Camp 2025'}</div>
            <div className="page-sub">Register for your immersive training experience</div>
          </div>

          <div className="camp-layout">
            <div>
              <div className="camp-hero-card">
                <div>
                  <div className="bebas" style={{ fontSize:32, color:'#fff', letterSpacing:2 }}>
                    {camp?.city || authProfile?.city || 'Unknown'} Camp
                  </div>
                  <div style={{ fontSize:14, color:'var(--accent)', marginTop:4 }}>
                    {camp?.start_date} – {camp?.end_date} · 7 days
                  </div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginTop:6 }}>
                    Immersive physical, mental, and cultural training
                  </div>
                </div>
                <span className="badge badge-accent" style={{ fontSize:13, padding:'6px 12px' }}>
                  {camp?.spots_remaining ?? 8} Spots Left
                </span>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom:16 }}>Registration Form</div>
                <div className="grid2">
                  <div className="input-group">
                    <label className="label">Full Name</label>
                    <input className="input" name="full_name" value={form.full_name} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label className="label">Age</label>
                    <input className="input" type="number" name="age" value={form.age} onChange={handleChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Emergency Contact Name</label>
                  <input className="input" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} placeholder="Emergency Contact Name" />
                </div>
                <div className="input-group">
                  <label className="label">Emergency Contact Phone</label>
                  <input className="input" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} placeholder="+1 201 555 0192" />
                </div>
                <div className="health-check">
                  <input type="checkbox" name="health_declaration" checked={form.health_declaration} onChange={handleChange} style={{ accentColor:'var(--primary)', marginTop:2 }} />
                  <span className="text-sm text-muted">I confirm I am medically fit to participate in intense physical training activities at the Iron Bond Summer Camp</span>
                </div>

                {error && (
                  <div style={{ color:'var(--error)', fontSize:13, marginBottom:12 }}>⚠ {error}</div>
                )}

                <button
                  className="btn btn-accent btn-block btn-lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : `Proceed to Payment — $${camp?.price || 499} →`}
                </button>
              </div>
            </div>

            <div>
              <div className="card" style={{ marginBottom:16 }}>
                <div className="card-title" style={{ marginBottom:12 }}>What's Included</div>
                {included.map(item => (
                  <div key={item} className="text-sm text-muted" style={{ marginBottom:8 }}>✅ {item}</div>
                ))}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom:12 }}>Price Summary</div>
                {[['Camp Fee', `$${camp?.price || 499}.00`], ['Tax', '$0.00']].map(([l, v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:14 }}>
                    <span className={l === 'Tax' ? 'text-muted' : ''}>{l}</span>
                    <span className={l === 'Tax' ? 'text-muted' : 'fw600'}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12 }}>
                  <span className="fw600">Total</span>
                  <div className="bebas" style={{ fontSize:36, color:'var(--primary)' }}>
                    ${camp?.price || 499}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}