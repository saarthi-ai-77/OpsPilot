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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'opspilot_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { data: member, error } = await supabase
        .from('members')
        .select('id, email, team_id')
        .eq('email', normalizedEmail)
        .single();

      if (error || !member) {
        return { success: false, error: 'User not found. Please check your email or contact your manager.' };
      }

      // Check if they are a manager in the teams table
      const { data: team } = await supabase
        .from('teams')
        .select('manager_email')
        .eq('id', member.team_id)
        .single();

      const role = team?.manager_email === normalizedEmail ? 'manager' : 'member';

      const userData: User = {
        id: member.id,
        email: member.email,
        team_id: member.team_id,
        role: role,
      };

      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An error occurred during login.' };
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
      let finalTeamId = teamId;

      if (isManager) {
        if (!teamName) return { success: false, error: 'Team name is required for managers.' };

        // Create team
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({ name: teamName, manager_email: normalizedEmail })
          .select()
          .single();

        if (teamError) {
          console.error('Team creation error:', teamError);
          return { success: false, error: 'Failed to create team. It might already exist.' };
        }
        finalTeamId = newTeam.id;
      } else {
        if (!teamId) return { success: false, error: 'Team ID is required for members.' };

        // Verify team exists
        const { data: existingTeam, error: verifyError } = await supabase
          .from('teams')
          .select('id')
          .eq('id', teamId)
          .single();

        if (verifyError || !existingTeam) {
          return { success: false, error: 'Team not found. Please verify the Team ID with your manager.' };
        }
      }

      // Create member
      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({
          email: normalizedEmail,
          team_id: finalTeamId!
        })
        .select()
        .single();

      if (memberError) {
        console.error('Member creation error:', memberError);
        return { success: false, error: 'This email is already registered.' };
      }

      const userData: User = {
        id: newMember.id,
        email: newMember.email,
        team_id: newMember.team_id,
        role: isManager ? 'manager' : 'member',
      };

      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'An error occurred during registration.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
