import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Navbar.css';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ isPublic = false }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        IRON <span>BOND</span>
      </Link>

      {isPublic ? (
        <div className="navbar-right">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/register" className="nav-link">About</Link>
          <button className="btn btn-ghost btn-sm nav-ghost" onClick={() => navigate('/login')}>Log In</button>
          <button className="btn btn-accent btn-sm" onClick={() => navigate('/register')}>Join Now</button>
        </div>
      ) : (
        <div className="navbar-right">
          
            href="https://tally.so/r/5BrLLN"
            target="_blank"
            rel="noreferrer"
            className="btn btn-accent btn-sm"
          >
            💬 Feedback
          </a>
          <button className="notif-btn" aria-label="Notifications">
            🔔<span className="notif-dot" />
          </button>
          <div className="navbar-avatar">{getInitials(displayName)}</div>
          <button className="btn btn-ghost btn-sm nav-ghost" onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </nav>
  );
}