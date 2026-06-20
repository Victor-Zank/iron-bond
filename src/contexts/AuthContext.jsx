import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner/Spinner';

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAuth() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user || null);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (!mounted) return;
        setProfile(profileData || null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    }

    fetchAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // when auth changes, re-fetch
      fetchAuth();
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
