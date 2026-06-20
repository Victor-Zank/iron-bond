import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser, profile: authProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const userToUse = authUser;
      setUser(userToUse);

      // Get latest registration for this user
      const { data, error } = await supabase
        .from('registrations')
        .select('*, camps(*)')
        .eq('user_id', userToUse.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error) setRegistration(data);
      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser]);

  if (loading) return (
    <div className="confirm-page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
        <Spinner />
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="confirm-page">
        <div className="confirm-box">
          <div className="confirm-icon">✓</div>
          <div className="bebas" style={{ fontSize:40, color:'var(--primary)', letterSpacing:3, marginBottom:8 }}>
            You're In!
          </div>
          <p className="text-muted" style={{ marginBottom:24 }}>
            Payment confirmed. See you at camp, {user?.user_metadata?.full_name || user?.email}.
          </p>

          <div className="card" style={{ textAlign:'left', marginBottom:16 }}>
            <div className="card-title" style={{ marginBottom:8 }}>
              {registration?.camps?.name || 'Summer Camp'}
            </div>
            <div className="card-sub" style={{ marginBottom:12 }}>
              {registration?.camps?.start_date} – {registration?.camps?.end_date}
            </div>
            {[
              `👤 ${user?.user_metadata?.full_name || user?.email}`,
              `📧 Confirmation sent to ${user?.email}`,
              `🔖 Order #IB-${registration?.id?.slice(0,8).toUpperCase()}`
            ].map(l => (
              <div key={l} style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>{l}</div>
            ))}
          </div>

          <div className="confirm-notice">
            ✅ Your Dashboard has been updated<br />
            📋 Event added to your Giyus roadmap<br />
            📧 Confirmation email on its way
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/dashboard')}>
            Back to Dashboard →
          </button>
        </div>
      </div>
    </>
  );
}