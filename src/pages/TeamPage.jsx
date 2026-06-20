import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner/Spinner';
import './TeamPage.css';

export default function TeamPage() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const { user: authUser, profile: authProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const userToUse = authUser;
      setUser(userToUse);

      // Get user's teams
      const { data: teamsData } = await supabase
        .from('user_teams')
        .select('*, teams(*)')
        .eq('user_id', userToUse.id);

      const teamsList = teamsData?.map(t => t.teams) || [];
      setTeams(teamsList);

      // Set first team as active
      if (teamsList.length > 0) {
        setActiveTeam(teamsList[0]);
        await fetchMessages(teamsList[0].id);
      }

      setLoading(false);
    }

    if (!authLoading) fetchData();
  }, [authLoading, authUser]);

  async function fetchMessages(teamId) {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
      .limit(50);

    setMessages(data || []);
    scrollToBottom();
  }

  async function handleTeamSelect(team) {
    setActiveTeam(team);
    await fetchMessages(team.id);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        team_id: activeTeam.id,
        user_id: user.id,
        content: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
      await fetchMessages(activeTeam.id);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') sendMessage();
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
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

  return (
    <>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Team Hub</div>
            <div className="page-sub">Connect and train with your local team</div>
          </div>

          <div className="chat-layout">
            {/* Team list */}
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">My Teams</div>
              {teams.map((t) => (
                <div
                  key={t.id}
                  className={`chat-member${activeTeam?.id === t.id ? ' active' : ''}`}
                  onClick={() => handleTeamSelect(t)}
                  style={{ cursor:'pointer' }}
                >
                  <div className="member-avatar">{getInitials(t.name)}</div>
                  <div style={{ flex:1 }}>
                    <div className="member-name">{t.name}</div>
                    <div className="text-xs text-muted">{t.city}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat area */}
            <div className="chat-main">
              <div className="chat-header">
                <div>
                  <div style={{ fontWeight:600 }}>{activeTeam?.name || 'Select a team'}</div>
                  <div className="text-xs text-muted">{activeTeam?.city}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost btn-sm">Members</button>
                  <button className="btn btn-ghost btn-sm">📌 Pinned</button>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="text-sm text-muted" style={{ textAlign:'center', marginTop:20 }}>
                    No messages yet. Say hello! 👋
                  </div>
                )}
                {messages.map((m) => {
                  const isMe = m.user_id === user?.id;
                  const senderName = m.profiles?.full_name || 'Unknown';
                  return (
                    <div key={m.id} className={`msg-row${isMe ? ' mine' : ''}`}>
                      <div className={`msg-avatar${isMe ? ' mine-ava' : ''}`}>
                        {getInitials(senderName)}
                      </div>
                      <div>
                        <div className="msg-sender">{isMe ? (user?.user_metadata?.full_name || senderName) : senderName}</div>
                        <div className={`msg-bubble${isMe ? ' mine' : ''}`}>{m.content}</div>
                        <div className="text-xs" style={{ color:'var(--light)', marginTop:3 }}>
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder={`Message ${activeTeam?.name || 'your team'}…`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="chat-send" onClick={sendMessage}>➤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}