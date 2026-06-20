import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import './HomePage.css';

const features = [
  { icon: '🏋️', title: 'Daily Combat Training', sub: 'IDF-inspired physical programs' },
  { icon: '🇮🇱', title: 'Heritage & Values',     sub: 'Connect to Israeli identity & ethos' },
  { icon: '👥', title: 'Team Communities',       sub: 'Train alongside peers by city' },
  { icon: '📋', title: 'Enlistment Guidance',    sub: 'Step-by-step bureaucratic support' },
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar isPublic />
      <div className="home-page">
        <div className="home-hero">
          <div className="hero-content">
            <div className="hero-eyebrow">IDF Lone Soldier Preparation Program</div>
            <h1 className="hero-title">IRON<br /><span>BOND</span></h1>
            <p className="hero-body">
              Train hard. Stay connected. Know the path.<br />
              Join thousands of young Jews in North America preparing to serve in the IDF.
            </p>
            <div className="hero-cta">
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/register')}>
                Join the Program →
              </button>
              <button className="btn btn-lg hero-login-btn" onClick={() => navigate('/login')}>
                Log In
              </button>
            </div>
          </div>

          <div className="hero-features">
            {features.map(f => (
              <div key={f.title} className="feature-pill">
                <span className="feature-ico">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
