import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner/Spinner';
import './ValuesPage.css';

const tabs = ['All', 'Battles', 'IDF Values', 'Mental Prep', 'Lone Soldier'];

export default function ValuesPage() {
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  async function fetchVideos() {
    setLoading(true);

    let query = supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by category if not "All"
    if (activeTab !== 'All') {
      query = query.eq('category', activeTab);
    }

    const { data, error } = await query;

    if (!error) setVideos(data || []);
    setLoading(false);
  }

  return (
    <>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Heritage & Values</div>
            <div className="page-sub">Deepen your connection to Israeli identity and IDF ethos</div>
          </div>

          <div className="values-tabs">
            {tabs.map((t) => (
              <div
                key={t}
                className={`values-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}
                style={{ cursor: 'pointer' }}
              >
                {t}
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ marginTop: 20, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Spinner />
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div className="text-muted" style={{ marginTop: 20 }}>
              No videos found in this category.
            </div>
          )}

          <div className="grid4">
            {videos.map(v => (
              <div key={v.id} className="video-card">
                <div className="video-thumb">
                  {v.thumbnail_url
                    ? <img src={v.thumbnail_url} alt={v.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div className="play-circle">▶</div>
                  }
                </div>
                <div className="video-info">
                  <div className="video-title">{v.title}</div>
                  <div className="video-sub">{v.duration_minutes} min · {v.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}