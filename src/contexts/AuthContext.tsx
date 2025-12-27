import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; isManager: boolean; teamName?: string; teamId?: string }) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  logout: () => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'opspilot_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        .maybeSingle();

      if (member) {
        await finalizeLogin(member);
      } else {
        setIsLoading(false);
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
      .maybeSingle();

    const role = team?.manager_email === member.email ? 'manager' : 'member';

    setUser({
      id: member.id,
      email: member.email,
      team_id: member.team_id,
      role: role,
    });
    setIsLoading(false);
  };


  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        await syncUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const register = async ({ email, password, name, isManager, teamName, teamId }: {
    email: string;
    password: string;
    name: string;
    isManager: boolean;
    teamName?: string;
    teamId?: string
  }): Promise<{ success: boolean; requiresVerification?: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Preliminary checks
      if (isManager && !teamName) return { success: false, error: 'Team name is required.' };
      if (!isManager && !teamId) return { success: false, error: 'Team ID is required.' };

      if (!isManager) {
        const { data: team, error: teamVerifyError } = await supabase
          .from('teams')
          .select('id')
          .eq('id', teamId)
          .maybeSingle();

        if (teamVerifyError) throw teamVerifyError;
        if (!team) return { success: false, error: 'Team not found.' };
      }

      // 1. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account.');

      const authId = authData.user.id;

      // 2. Create Team/Member records immediately (Idempotent for recovery)
      let finalTeamId = teamId;

      if (isManager) {
        // Check if team already exists for this manager (Recovery case)
        const { data: existingTeam, error: teamCheckError } = await supabase
          .from('teams')
          .select('id')
          .eq('manager_email', normalizedEmail)
          .maybeSingle();

        if (teamCheckError) throw teamCheckError;

        if (existingTeam) {
          finalTeamId = existingTeam.id;
        } else {
          const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert({
              name: teamName,
              manager_email: normalizedEmail,
              manager_name: name.trim()
            })
            .select()
            .single();

          if (teamError) throw teamError;
          if (newTeam) finalTeamId = newTeam.id;
        }
      }

      // Check if member already exists (Recovery case)
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('members')
        .select('id')
        .eq('id', authId)
        .maybeSingle();

      if (memberCheckError) throw memberCheckError;

      if (!existingMember) {
        const { error: memberError } = await supabase
          .from('members')
          .insert({
            id: authId,
            email: normalizedEmail,
            name: name.trim(),
            team_id: finalTeamId
          });

        if (memberError) {
          console.error('Member creation error:', memberError);
          throw memberError;
        }
      }

      // If user is immediately signed in
      if (authData.session) {
        await syncUser(authData.user);
        return { success: true };
      }

      // If session is missing, it means email verification is required
      return { success: true, requiresVerification: true };
    } catch (err: any) {
      console.error('Registration error:', err);

      // Handle the case where the user already exists (likely from Magic Link era)
      if (err.status === 422 || err.message?.toLowerCase().includes('already registered')) {
        return {
          success: false,
          error: 'An account with this email already exists. Please try to Sign In instead.'
        };
      }

      return { success: false, error: err.message || 'Failed to register account.' };
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
