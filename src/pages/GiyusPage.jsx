import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './GiyusPage.css';

export default function GiyusPage() {
  const [steps, setSteps] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user: authUser, profile: authProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const userToUse = authUser;
      setUser(userToUse);

      const { data, error } = await supabase
        .from('giyus_steps')
        .select('*')
        .eq('user_id', userToUse.id)
        .order('step_number', { ascending: true });

      if (!error) setSteps(data);
      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser]);

  async function markStepComplete(stepId) {
    const { error } = await supabase
      .from('giyus_steps')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', stepId);

    if (!error) {
      setSteps(prev =>
        prev.map(s => s.id === stepId ? { ...s, is_completed: true } : s)
      );
    }
  }

  // Calculate progress
  const completedCount = steps.filter(s => s.is_completed).length;
  const totalSteps = steps.length || 6;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const activeStep = steps.find(s => !s.is_completed);

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
            <div className="page-title">Giyus Center</div>
            <div className="page-sub">Your enlistment roadmap — step by step</div>
          </div>

          <div className="giyus-layout">
            <div>
              {/* Progress hero */}
              <div className="giyus-hero">
                <div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1 }}>
                    Your Progress
                  </div>
                  <div className="bebas" style={{ fontSize:40, color:'#fff', letterSpacing:2 }}>
                    Step {completedCount + 1} of {totalSteps}
                  </div>
                  <div style={{ fontSize:13, color:'var(--accent)' }}>
                    {activeStep?.title || 'All steps completed!'} — {activeStep ? 'In Progress' : '✓ Done'}
                  </div>
                </div>
                <div className="bebas" style={{ fontSize:56, color:'rgba(255,255,255,0.15)' }}>
                  {progressPercent}%
                </div>
              </div>
              <div className="progress" style={{ marginBottom:24 }}>
                <div className="progress-fill accent" style={{ width:`${progressPercent}%` }} />
              </div>

              {steps.map(s => {
                const status = s.is_completed ? 'done' : s.id === activeStep?.id ? 'active' : 'todo';
                return (
                  <div key={s.id} className={`giyus-step ${status}`}>
                    <div className={`step-num ${status}`}>
                      {s.is_completed ? '✓' : s.step_number}
                    </div>
                    <div style={{ flex:1 }}>
                      <div className="step-title">{s.title}</div>
                      <div className="step-sub">{s.description}</div>
                    </div>
                    {status === 'done'   && <span className="badge badge-success">Done</span>}
                    {status === 'active' && <span className="badge badge-accent">In Progress</span>}
                  </div>
                );
              })}

              {activeStep && (
                <button
                  className="btn btn-primary btn-lg"
                  style={{ marginTop:16 }}
                  onClick={() => markStepComplete(activeStep.id)}
                >
                  Mark Step {activeStep.step_number} as Complete ✓
                </button>
              )}
            </div>

            <div>
              <div className="card" style={{ marginBottom:16 }}>
                <div className="card-title" style={{ marginBottom:16 }}>Downloads</div>
                {[['📄 Form 101','Required · PDF'],['📄 Health Declaration','Step 3 · PDF']].map(([t,s]) => (
                  <div key={t} className="dl-row">
                    <div><div className="text-sm fw600">{t}</div><div className="text-xs text-muted">{s}</div></div>
                    <button className="btn btn-outline btn-sm">Download</button>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom:12 }}>Important Dates</div>
                {steps
                  .filter(s => s.deadline)
                  .map(s => (
                    <div key={s.id} style={{ marginBottom:10 }}>
                      <div className="text-xs fw600">{s.title}</div>
                      <div className="text-sm text-muted">{s.deadline}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}