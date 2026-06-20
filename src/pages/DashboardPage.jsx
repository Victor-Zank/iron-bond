import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import StatCard from '../components/ui/StatCard';
import './DashboardPage.css';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [teamMessages, setTeamMessages] = useState([]);
  const [teamName, setTeamName] = useState(null);
  const [camp, setCamp] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(profileData || null);

      // Get leaderboard (top 500) and compute user's rank
      const { data: lbData } = await supabase
        .from('profiles')
        .select('user_id, total_points')
        .order('total_points', { ascending: false })
        .limit(500);
      const rank = (lbData && lbData.findIndex(u => u.user_id === user.id) >= 0)
        ? (lbData.findIndex(u => u.user_id === user.id) + 1)
        : null;
      setMyRank(rank);

      // Get user's teams and last 2 messages from first team (if any)
      const { data: teamsData } = await supabase
        .from('user_teams')
        .select('*, teams(*)')
        .eq('user_id', user.id);
      const teamsList = teamsData?.map(t => t.teams) || [];
      if (teamsList.length > 0) {
        const team = teamsList[0] || {};
        const teamId = team.id;
        // Prefer the name from the joined `teams` object. If it's missing,
        // fetch the team's `name` directly from the `teams` table to avoid
        // falling back to the user's `city`.
        let name = team.name || null;
        if (!name && teamId) {
          const { data: teamRow } = await supabase
            .from('teams')
            .select('name')
            .eq('id', teamId)
            .single();
          name = teamRow?.name || null;
        }
        setTeamName(name);
        const { data: msgs } = await supabase
          .from('messages')
          .select('*, profiles(full_name)')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })
          .limit(2);
        setTeamMessages((msgs || []).reverse());
      }

      // Fetch latest camp (if any) to display real city and dates
      const { data: campsData } = await supabase
        .from('camps')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(1);
      setCamp(campsData?.[0] || null);

      setLoading(false);
    }

    fetchData();
  }, [navigate]);

  function formatCampDates(startDate, endDate) {
    if (!startDate) return '';
    const s = new Date(startDate);
    const e = endDate ? new Date(endDate) : null;
    const monthName = s.toLocaleString('en-US', { month: 'long' });
    const year = s.getFullYear();
    if (!e) return `${monthName} ${s.getDate()}, ${year}`;
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
      return `${monthName} ${s.getDate()}-${e.getDate()}, ${year}`;
    }
    if (s.getFullYear() === e.getFullYear()) {
      const endMonth = e.toLocaleString('en-US', { month: 'long' });
      return `${monthName} ${s.getDate()} - ${endMonth} ${e.getDate()}, ${year}`;
    }
    return `${monthName} ${s.getDate()}, ${s.getFullYear()} - ${e.toLocaleString('en-US', { month: 'long' })} ${e.getDate()}, ${e.getFullYear()}`;
  }
  return (
    <>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          {/* Hero Banner */}
          <div className="dash-hero">
            <div>
              <div className="dash-greeting">Good morning,</div>
              <div className="dash-name bebas">{profile?.full_name?.toUpperCase() || user?.email}</div>
              <div className="dash-sub">Day {profile?.streak_days ?? 0} of the Program 🔥</div>
            </div>
            <div className="dash-stats">
              <div className="stat-pill"><div className="stat-pill-num">{profile?.streak_days ?? 0}</div><div className="stat-pill-label">Streak 🔥</div></div>
              <div className="stat-pill"><div className="stat-pill-num">{(profile?.total_points ?? 0).toLocaleString()}</div><div className="stat-pill-label">Points</div></div>
              <div className="stat-pill"><div className="stat-pill-num">{myRank ? `#${myRank}` : '-'}</div><div className="stat-pill-label">{profile?.city || '—'}</div></div>
            </div>
          </div>

          {/* Top cards */}
          <div className="grid2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div><div className="card-title">Today's Workout</div><div className="card-sub">Combat Fitness · Day 3</div></div>
                <span className="badge badge-accent">38%</span>
              </div>
              <div className="progress" style={{ marginBottom: 8 }}><div className="progress-fill" style={{ width:'38%' }} /></div>
              <div className="text-xs text-muted" style={{ marginBottom: 16 }}>35 min · 6 exercises remaining</div>
              <button className="btn btn-primary btn-block" onClick={() => navigate('/workout')}>Continue Workout →</button>
            </div>

            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div><div className="card-title">Giyus Progress</div><div className="card-sub">Step 2 of 6 · Form 101</div></div>
                <span className="badge badge-muted">33%</span>
              </div>
              <div className="progress" style={{ marginBottom: 8 }}><div className="progress-fill" style={{ width:'33%' }} /></div>
              <div className="text-xs text-muted" style={{ marginBottom: 16 }}>Next: Complete medical exam form</div>
              <button className="btn btn-outline btn-block" onClick={() => navigate('/giyus')}>View Roadmap →</button>
            </div>
          </div>

          {/* Bottom cards */}
          <div className="grid2">
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div className="card-title">{teamName || profile?.city || 'Your Team'}</div>
                <span className="badge badge-primary">2 New</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                {teamMessages.length === 0 && (
                  <div className="text-sm text-muted">No recent team messages.</div>
                )}
                {teamMessages.map((m) => {
                  const init = (m.profiles?.full_name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
                  const name = m.profiles?.full_name || 'Unknown';
                  return (
                    <div key={m.id || name} style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div className="mini-avatar">{init}</div>
                      <div><div className="text-sm fw600">{name}</div><div className="text-xs text-muted">{m.content}</div></div>
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-outline btn-block" onClick={() => navigate('/team')}>Open Team Chat →</button>
            </div>

            <div className="card camp-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div><div className="card-title">Summer Camp 2025</div><div className="card-sub">{camp ? `${camp.city || '—'} · ${formatCampDates(camp.start_date, camp.end_date)}` : `${profile?.city || '—'} · TBD`}</div></div>
                <span className="badge badge-accent">8 Spots Left!</span>
              </div>
              <div className="text-sm text-muted" style={{ marginBottom:16 }}>Immersive 7-day physical & cultural training. $499 per person.</div>
              <button className="btn btn-accent btn-block" onClick={() => navigate('/camp')}>Register for Camp →</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
