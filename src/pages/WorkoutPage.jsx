import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './WorkoutPage.css';

export default function WorkoutPage() {
  const [user, setUser] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const { user: authUser, profile: authProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const userToUse = authUser;
      setUser(userToUse);

      // Get user profile for day number (use authProfile if available)
      const profileData = authProfile;
      setProfile(profileData);

      // Get today's workout
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*')
        .eq('day_number', profileData?.streak_days || 1)
        .single();
      setWorkout(workoutData);

      // Get exercises for this workout
      if (workoutData) {
        const { data: exercisesData } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', workoutData.id)
          .order('order_index', { ascending: true });
        setExercises(exercisesData || []);
      }

      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser, authProfile]);

  async function toggleExercise(exerciseId, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const { error } = await supabase
      .from('exercises')
      .update({ status: newStatus })
      .eq('id', exerciseId);

    if (!error) {
      setExercises(prev =>
        prev.map(ex => ex.id === exerciseId ? { ...ex, status: newStatus } : ex)
      );
    }
  }

  async function markWorkoutComplete() {
    setCompleting(true);

    // Update streak_days in profile
    const { error } = await supabase
      .from('profiles')
      .update({ streak_days: (profile?.streak_days || 0) + 1 })
      .eq('user_id', user.id);

    if (!error) {
      alert('Workout complete! 🔥 Streak updated!');
    }
    setCompleting(false);
  }

  // Calculate progress
  const doneCount = exercises.filter(ex => ex.status === 'done').length;
  const totalCount = exercises.length || 1;
  const progressPercent = Math.round((doneCount / totalCount) * 100);
  const activeExercise = exercises.find(ex => ex.status !== 'done');

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
          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div className="page-title">{workout?.title || 'Today\'s Workout'}</div>
              <div className="page-sub">
                {workout?.duration_minutes} min · {exercises.length} exercises · Day {profile?.streak_days || 1} of program
              </div>
            </div>
            <span className="badge badge-accent" style={{ fontSize:14, padding:'6px 14px' }}>
              {progressPercent}% Complete
            </span>
          </div>

          <div className="workout-layout">
            <div className="workout-main">
              {/* Video */}
              <div className="video-hero">
                <div className="play-btn">▶</div>
                <div className="video-label">
                  <div style={{ fontSize:12, opacity:.7 }}>Day {profile?.streak_days} Instructional Video</div>
                  <div style={{ fontSize:15, fontWeight:600 }}>{workout?.title}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="card" style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span className="text-sm fw600">Overall Progress</span>
                  <span className="text-sm text-muted">{progressPercent}% · {doneCount} of {totalCount} done</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width:`${progressPercent}%` }} />
                </div>
              </div>

              {/* Exercise list */}
              {exercises.map(ex => {
                const isDone = ex.status === 'done';
                const isActive = ex.id === activeExercise?.id;
                const statusClass = isDone ? 'done' : isActive ? 'active' : '';

                return (
                  <div
                    key={ex.id}
                    className={`exercise-row ${statusClass}`}
                    onClick={() => toggleExercise(ex.id, ex.status)}
                    style={{ cursor:'pointer' }}
                  >
                    <div className={`check-circle ${isDone ? 'done' : ''}`}>
                      {isDone ? '✓' : ''}
                    </div>
                    <div style={{ flex:1 }}>
                      <div className={`exercise-name${isDone ? ' done-text' : ''}`}>{ex.name}</div>
                      <div className="exercise-meta">{ex.sets} sets × {ex.reps} reps</div>
                    </div>
                    {isDone   && <span style={{ fontSize:12, fontWeight:600, color:'var(--success)' }}>Done ✓</span>}
                    {isActive && <span style={{ fontSize:12, fontWeight:600, color:'var(--accent)' }}>In Progress</span>}
                  </div>
                );
              })}

              <button
                className="btn btn-accent btn-block btn-lg"
                style={{ marginTop:16 }}
                onClick={markWorkoutComplete}
                disabled={completing}
              >
                {completing ? 'Saving...' : 'Mark Workout Complete ✓'}
              </button>
            </div>

            <div className="workout-side">
              <div className="card" style={{ marginBottom:16 }}>
                <div className="card-title" style={{ marginBottom:16 }}>Today's Stats</div>
                {[
                  [workout?.calories_estimate || '—', 'Calories'],
                  [`${workout?.duration_minutes || '—'} min`, 'Duration'],
                  [workout?.difficulty || 'Medium', 'Difficulty']
                ].map(([v, l]) => (
                  <div key={l} style={{ marginBottom:16 }}>
                    <div className="text-xs text-muted" style={{ marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                    <div className="bebas" style={{ fontSize:28, color: l==='Difficulty' ? 'var(--accent)' : 'var(--primary)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom:8 }}>Team Activity</div>
                <div className="text-sm text-muted" style={{ marginBottom:10 }}>
                  {doneCount} exercises completed so far
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