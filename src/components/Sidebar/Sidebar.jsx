import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const navItems = [
  { label: 'Main', items: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/workout',   icon: '💪', label: 'Workout' },
    { to: '/values',    icon: '🎥', label: 'Values Library' },
    { to: '/team',      icon: '💬', label: 'Team Hub', badge: 2 },
  ]},
  { label: 'Enlistment', items: [
    { to: '/giyus', icon: '📋', label: 'Giyus Center' },
    { to: '/camp',  icon: '⛺', label: 'Summer Camp' },
  ]},
  { label: 'Account', items: [
    { to: '/profile',  icon: '👤', label: 'Profile' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const [activeTeamName, setActiveTeamName] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchTeams() {
      if (!user) return;
      const { data } = await supabase
        .from('user_teams')
        .select('teams(*)')
        .eq('user_id', user.id)
        .limit(1);
      const teamsList = data?.map(t => t.teams) || [];
      if (mounted) setActiveTeamName(teamsList[0]?.name || null);
    }
    fetchTeams();
    return () => { mounted = false; };
  }, [user]);

  function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <aside className="sidebar-nav">
      {navItems.map(section => (
        <div key={section.label} className="sidebar-section">
          <div className="sidebar-label">{section.label}</div>
          {section.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-ico">{item.icon}</span>
              {item.label}
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{getInitials(profile?.full_name || user?.user_metadata?.full_name || user?.email)}</div>
        <div>
          <div className="sidebar-user-name">{profile?.full_name || user?.user_metadata?.full_name || user?.email}</div>
          <div className="sidebar-user-sub">Day {profile?.streak_days ?? 0} · {activeTeamName || profile?.city || '—'}</div>
        </div>
      </div>
    </aside>
  );
}
