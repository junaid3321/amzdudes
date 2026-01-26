import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  team_lead_id: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching employee data to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchEmployeeData(session.user.id);
          }, 0);
        } else {
          setEmployee(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEmployeeData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEmployeeData = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, role, team_lead_id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching employee:', error);
      }
      setEmployee(data as Employee | null);
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

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        }
      }
    });

    if (!error && data.user) {
      // Link this auth user to an existing employee record by email
      const { error: linkError } = await supabase
        .from('employees')
        .update({ auth_user_id: data.user.id })
        .eq('email', email);
      
      if (linkError) {
        console.warn('Could not link employee record:', linkError);
      }
    }

    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    user,
    session,
    employee,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
  };
}
