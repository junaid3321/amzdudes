import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  client_type: string;
  health_score: number;
  health_status: string;
}

export function useClientAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching client data to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchClientData(session.user.id);
          }, 0);
        } else {
          setClient(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClientData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClientData = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, contact_name, email, client_type, health_score, health_status')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching client:', error);
      }
      setClient(data as ClientData | null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    user,
    session,
    client,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!session,
  };
}
