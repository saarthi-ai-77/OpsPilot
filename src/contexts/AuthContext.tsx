import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; isManager: boolean; teamName?: string; teamId?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isManager: boolean;
  isMagicLinkSent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'opspilot_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserMetadata(session.user.email!, session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleSignedIn(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignedIn = async (session: any) => {
    const email = session.user.email;
    const authId = session.user.id;

    // Check if user exists in members table
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, email, team_id')
      .eq('email', email)
      .single();

    if (existingMember) {
      await fetchUserMetadata(email, authId);
    } else {
      // Check for pending signup
      const pendingStr = localStorage.getItem('opspilot_pending_signup');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.email === email) {
          await completeRegistration(pending, authId);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
  };

  const fetchUserMetadata = async (email: string, authId: string) => {
    setIsLoading(true);
    try {
      const { data: member } = await supabase
        .from('members')
        .select('id, email, team_id')
        .eq('email', email)
        .single();

      if (member) {
        const { data: team } = await supabase
          .from('teams')
          .select('manager_email')
          .eq('id', member.team_id)
          .single();

        const role = team?.manager_email === email ? 'manager' : 'member';

        setUser({
          id: member.id,
          email: member.email,
          team_id: member.team_id,
          role: role,
        });
      }
    } catch (error) {
      console.error('Error fetching user metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async (pending: any, authId: string) => {
    try {
      let finalTeamId = pending.teamId;

      if (pending.isManager) {
        const { data: newTeam } = await supabase
          .from('teams')
          .insert({ name: pending.teamName, manager_email: pending.email })
          .select()
          .single();
        if (newTeam) finalTeamId = newTeam.id;
      }

      const { data: newMember } = await supabase
        .from('members')
        .insert({
          id: authId, // Use Supabase Auth ID as primary key
          email: pending.email,
          team_id: finalTeamId
        })
        .select()
        .single();

      if (newMember) {
        localStorage.removeItem('opspilot_pending_signup');
        await fetchUserMetadata(pending.email, authId);
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setIsMagicLinkSent(true);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Failed to send magic link.' };
    }
  };

  const register = async ({ email, isManager, teamName, teamId }: {
    email: string;
    isManager: boolean;
    teamName?: string;
    teamId?: string
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Preliminary checks
      if (isManager && !teamName) return { success: false, error: 'Team name is required.' };
      if (!isManager && !teamId) return { success: false, error: 'Team ID is required.' };

      if (!isManager) {
        const { data: team } = await supabase.from('teams').select('id').eq('id', teamId).single();
        if (!team) return { success: false, error: 'Team not found.' };
      }

      // Save pending signup info
      localStorage.setItem('opspilot_pending_signup', JSON.stringify({
        email: normalizedEmail,
        isManager,
        teamName,
        teamId
      }));

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            is_manager: isManager
          }
        },
      });

      if (error) throw error;

      setIsMagicLinkSent(true);
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'Failed to send magic link.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isManager: user?.role === 'manager',
        isMagicLinkSent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
