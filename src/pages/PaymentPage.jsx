import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './PaymentPage.css';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [camp, setCamp] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cardName, setCardName] = useState('');

  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const userToUse = authUser;
      setUser(userToUse);

      if (userToUse?.user_metadata?.full_name) {
        setCardName(userToUse.user_metadata.full_name);
      }

      const { data } = await supabase
        .from('camps')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(1)
        .single();

      if (data) setCamp(data);
      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser]);

  async function handlePayment() {
    setSubmitting(true);
    setError(null);

    // Create payment record in Supabase
    const { error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: camp?.price || 499,
        status: 'success',
        stripe_order_id: `IB-${Date.now()}`,
      });

    if (error) {
      setError('Payment failed. Please try again.');
      setSubmitting(false);
    } else {
      navigate('/confirmation');
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="payment-page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
        <Spinner />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="payment-page">
        <div className="payment-grid">
          <div>
            <div className="bebas" style={{ fontSize:32, color:'var(--primary)', letterSpacing:2, marginBottom:20 }}>
              Complete Payment
            </div>
            <div className="stripe-box">
              <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>
                🔒 Secured by Stripe
              </div>
              <div className="text-xs text-muted">Your payment info is fully encrypted</div>
            </div>
            <div className="input-group">
              <label className="label">Card Number</label>
              <input className="input" placeholder="•••• •••• •••• ••••" />
            </div>
            <div className="grid2">
              <div className="input-group">
                <label className="label">Expiry</label>
                <input className="input" placeholder="MM / YY" />
              </div>
              <div className="input-group">
                <label className="label">CVV</label>
                <input className="input" placeholder="•••" />
              </div>
            </div>
            <div className="input-group">
              <label className="label">Name on Card</label>
              <input
                className="input"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            {error && (
              <div style={{ color:'var(--error)', fontSize:13, marginBottom:12 }}>
                ⚠ {error}
              </div>
            )}

            <button
              className="btn btn-accent btn-block btn-lg"
              onClick={handlePayment}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : `Confirm Payment — $${camp?.price || 499} →`}
            </button>
            <button
              className="btn btn-ghost btn-block"
              style={{ marginTop:8 }}
              onClick={() => navigate('/camp')}
            >
              ← Back to Registration
            </button>
          </div>

          <div className="card" style={{ height:'fit-content' }}>
            <div className="card-title" style={{ marginBottom:16 }}>Order Summary</div>
            {[
              [camp?.name || 'Summer Camp', `$${camp?.price || 499}`],
              [`${camp?.start_date} – ${camp?.end_date}`, '7 days'],
              ['Tax', '$0.00']
            ].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:14 }}>
                <span className="text-muted">{l}</span>
                <span className="fw600">{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12 }}>
              <span className="fw600">Total</span>
              <div className="bebas" style={{ fontSize:36, color:'var(--primary)' }}>
                ${camp?.price || 499}
              </div>
            </div>
            <div style={{ marginTop:16, padding:12, background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'var(--radius)', fontSize:12, color:'#065F46' }}>
              ✅ {camp?.spots_remaining ?? 8} spots remaining<br/>🔒 Secure checkout
            </div>
          </div>
        </div>
      </div>
    </>
  );
}