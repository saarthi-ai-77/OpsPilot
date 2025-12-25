import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'opspilot_user';

// Demo users for the portfolio project
const DEMO_USERS: Record<string, User> = {
  'manager@demo.com': {
    id: '1',
    email: 'manager@demo.com',
    name: 'Alex Manager',
    role: 'manager',
    teamId: 'team-1',
    teamName: 'Engineering Team',
  },
  'member@demo.com': {
    id: '2',
    email: 'member@demo.com',
    name: 'Jordan Developer',
    role: 'member',
    teamId: 'team-1',
    teamName: 'Engineering Team',
  },
};

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
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check demo users first
    if (DEMO_USERS[normalizedEmail]) {
      const demoUser = DEMO_USERS[normalizedEmail];
      setUser(demoUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      return { success: true };
    }

    // For any other email, create a member user
    const newUser: User = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      role: 'member',
      teamId: 'team-1',
      teamName: 'Engineering Team',
    };

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
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
