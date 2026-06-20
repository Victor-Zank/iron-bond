import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import StatCard from '../components/ui/StatCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './ProfilePage.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user: authUser, profile: authProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      // Use auth context
      setUser(authUser);
      setProfile(authProfile);

      // Get leaderboard — top 5 users by total_points
      const { data: lbData } = await supabase
        .from('profiles')
        .select('user_id, full_name, total_points, city')
        .order('total_points', { ascending: false })
        .limit(5);
      setLeaderboard(lbData || []);

      // Get recent giyus steps completed
      if (authUser) {
        const { data: activityData } = await supabase
          .from('giyus_steps')
          .select('title, completed_at')
          .eq('user_id', authUser.id)
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
          .limit(4);
        setActivity(activityData || []);
      }

      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser, authProfile]);

  // Get initials from full name
  function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Format date to readable string
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
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

  const myRank = leaderboard.findIndex(u => u.user_id === user?.id) + 1;

  return (
    <>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(profile?.full_name)}
            </div>
            <div style={{ flex:1 }}>
              <div className="bebas profile-name">
                {profile?.full_name?.toUpperCase() || user?.email}
              </div>
              <div className="text-muted" style={{ fontSize:13 }}>
                {profile?.city || 'Unknown city'} · Member since {new Date(user?.created_at).toLocaleDateString('en-US', { month:'short', year:'numeric' })}
              </div>
              <span className="badge badge-success" style={{ marginTop:8, display:'inline-block' }}>
                Active Member
              </span>
            </div>
            <button className="btn btn-outline" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.3)' }}>
              Edit Profile
            </button>
          </div>

          <div className="grid2">
            <div>
              <div className="card" style={{ marginBottom:16 }}>
                <div className="card-title" style={{ marginBottom:16 }}>My Stats</div>
                <div className="grid3">
                  <StatCard num={profile?.streak_days ?? 0}    label="Day Streak" />
                  <StatCard num={profile?.total_points?.toLocaleString() ?? 0} label="Total Points" />
                  <StatCard num={myRank > 0 ? `#${myRank}` : '-'} label="Rank" accent />
                </div>
              </div>

              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div className="card-title">Leaderboard — {profile?.city || 'Global'}</div>
                  <button className="btn btn-ghost btn-sm">View All</button>
                </div>
                {leaderboard.map((u, i) => {
                  const isCurrentUser = u.user_id === user?.id;
                  return (
                    <div key={i} className={`lb-row${isCurrentUser ? ' me' : ''}`}>
                      <div className={`lb-rank${i === 0 ? ' gold' : ''}`}>#{i + 1}</div>
                      <div className={`lb-avatar${isCurrentUser ? ' me' : ''}`}>
                        {getInitials(u.full_name)}
                      </div>
                      <div style={{ flex:1, fontWeight: isCurrentUser ? 600 : 400, fontSize:14 }}>
                        {u.full_name}{isCurrentUser ? ' (you)' : ''}
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--primary)' }}>
                        {u.total_points?.toLocaleString()} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom:16 }}>Recent Activity</div>
              {activity.length === 0 && (
                <div className="text-sm text-muted">No activity yet.</div>
              )}
              {activity.map((a, i) => (
                <div key={i} className="activity-row" style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className={`act-dot${i === 0 ? ' active' : ''}`} />
                  <div>
                    <div className="text-sm fw600">Completed: {a.title}</div>
                    <div className="text-xs text-muted">{formatDate(a.completed_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}