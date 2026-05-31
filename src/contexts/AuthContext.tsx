import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAppUser(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    setAppUser(data ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchAppUser(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchAppUser(session.user.id);
      } else {
        setAppUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setAppUser(null);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, appUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
