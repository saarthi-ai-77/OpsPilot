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
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncUser(session.user);
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session) {
        await syncUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUser = async (authUser: any) => {
    setIsLoading(true);
    const email = authUser.email;
    const authId = authUser.id;

    try {
      // 1. Try to find the member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, email, team_id')
        .eq('email', email)
        .single();

      if (member) {
        await finalizeLogin(member);
      } else {
        // 2. No member record? Check for pending signup
        const pendingStr = localStorage.getItem('opspilot_pending_signup');
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          if (pending.email.toLowerCase() === email.toLowerCase()) {
            await completeRegistration(pending, authId);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Sync user error:', err);
      setIsLoading(false);
    }
  };

  const finalizeLogin = async (member: any) => {
    const { data: team } = await supabase
      .from('teams')
      .select('manager_email')
      .eq('id', member.team_id)
      .single();

    const role = team?.manager_email === member.email ? 'manager' : 'member';

    setUser({
      id: member.id,
      email: member.email,
      team_id: member.team_id,
      role: role,
    });
    setIsLoading(false);
  };

  const completeRegistration = async (pending: any, authId: string) => {
    console.log('Completing registration for:', pending.email);
    try {
      let finalTeamId = pending.teamId;

      if (pending.isManager) {
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({ name: pending.teamName, manager_email: pending.email })
          .select()
          .single();

        if (teamError) throw teamError;
        if (newTeam) finalTeamId = newTeam.id;
      }

      // We use the authId as the primary key if the table allows, 
      // but to be safe and compatible with existing auto-inc pk, 
      // we check if 'id' insert is required or allowed.
      // Trying to insert without id first to allow db-side generation 
      // of serial pks, or providing it if the table is set for uuid pks.
      const memberInsert: any = {
        email: pending.email,
        team_id: finalTeamId
      };

      // If authId is required as PK, we include it. 
      // If the user's DB has a serial PK, this might fail or be ignored.
      memberInsert.id = authId;

      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert(memberInsert)
        .select()
        .single();

      if (memberError) {
        console.error('Member creation error, trying without explicit ID:', memberError);
        // Fallback: try inserting without explicit ID in case it's a serial PK
        delete memberInsert.id;
        const { data: retryMember, error: retryError } = await supabase
          .from('members')
          .insert(memberInsert)
          .select()
          .single();

        if (retryError) throw retryError;
        if (retryMember) await finalizeLogin(retryMember);
      } else if (newMember) {
        await finalizeLogin(newMember);
      }

      localStorage.removeItem('opspilot_pending_signup');
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
