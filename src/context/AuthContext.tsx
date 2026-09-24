import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, updateSupabaseCredentials } from '../lib/supabase';
import { UserProfile, RegionCode } from '../types/carbon';

export interface AuthUser {
  id: string;
  email?: string;
  isAnonymous?: boolean;
  user_metadata?: {
    full_name?: string;
    organization?: string;
    name?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  isSupabaseConnected: boolean;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string, org?: string) => Promise<void>;
  signInGuest: (customName?: string, customEmail?: string, customOrg?: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  connectSupabaseCredentials: (url: string, key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_PROFILE_KEY = 'cstack_current_user_profile';
const STORAGE_USER_KEY = 'cstack_current_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured());

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Helper to persist profile
  const saveProfileLocally = (profile: UserProfile, authUser: AuthUser) => {
    setUser(authUser);
    setUserProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    }
  };

  // Sync Supabase user to UserProfile
  const mapSupabaseUserToProfile = (sbUser: SupabaseUser, metaOverride?: { name?: string; org?: string }): UserProfile => {
    const fullName = metaOverride?.name || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Climate Lead';
    const org = metaOverride?.org || sbUser.user_metadata?.organization || 'CSTACK Enterprise';
    
    return {
      uid: sbUser.id,
      email: sbUser.email || 'analyst@cstack.climate',
      displayName: fullName,
      organization: org,
      preferredRegion: 'IN',
      targetNetZeroYear: 2030,
      reductionGoalPercent: 50,
      createdAt: sbUser.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    // 1. Check if user already had a saved session in localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
        if (storedUser && storedProfile) {
          setUser(JSON.parse(storedUser));
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.warn('Local session restore error:', e);
      }
    }

    // 2. If Supabase is configured with real credentials, subscribe to auth state
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          saveProfileLocally(profile, {
            id: session.user.id,
            email: session.user.email,
            isAnonymous: false,
            user_metadata: session.user.user_metadata,
          });
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          saveProfileLocally(profile, {
            id: session.user.id,
            email: session.user.email,
            isAnonymous: false,
            user_metadata: session.user.user_metadata,
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const connectSupabaseCredentials = (url: string, key: string): boolean => {
    try {
      updateSupabaseCredentials(url, key);
      setIsSupabaseConnected(true);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Invalid Supabase URL or Anon Key');
      return false;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
      } else {
        // Instant simulated Google Auth session without blocking user
        const mockId = `google_usr_${Date.now().toString(36)}`;
        const authUser: AuthUser = {
          id: mockId,
          email: 'lakshaygoel611@gmail.com',
          isAnonymous: false,
          user_metadata: {
            full_name: 'Lakshay Goel',
            organization: 'Enterprise Climate Workspace',
          },
        };
        const profile: UserProfile = {
          uid: mockId,
          email: 'lakshaygoel611@gmail.com',
          displayName: 'Lakshay Goel',
          organization: 'Enterprise Climate Workspace',
          preferredRegion: 'IN',
          targetNetZeroYear: 2030,
          reductionGoalPercent: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveProfileLocally(profile, authUser);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(err?.message || 'Failed to sign in with Google');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
        if (data.user) {
          const profile = mapSupabaseUserToProfile(data.user);
          saveProfileLocally(profile, {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          });
        }
      } else {
        // Direct local authentication session
        const mockId = `usr_${Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
        const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const authUser: AuthUser = {
          id: mockId,
          email,
          isAnonymous: false,
        };
        const profile: UserProfile = {
          uid: mockId,
          email,
          displayName: name,
          organization: 'Climate Analytics Lab',
          preferredRegion: 'IN',
          targetNetZeroYear: 2030,
          reductionGoalPercent: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveProfileLocally(profile, authUser);
      }
    } catch (err: any) {
      console.error('Supabase Email sign in error:', err);
      setAuthError(err?.message || 'Invalid email or password.');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string, org?: string) => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              full_name: name,
              organization: org,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          const profile = mapSupabaseUserToProfile(data.user, { name, org });
          saveProfileLocally(profile, {
            id: data.user.id,
            email: data.user.email,
            user_metadata: { full_name: name, organization: org },
          });
        }
      } else {
        const mockId = `usr_${Date.now()}`;
        const authUser: AuthUser = {
          id: mockId,
          email,
          isAnonymous: false,
          user_metadata: { full_name: name, organization: org },
        };
        const profile: UserProfile = {
          uid: mockId,
          email,
          displayName: name || email.split('@')[0],
          organization: org || 'CSTACK Workspace',
          preferredRegion: 'IN',
          targetNetZeroYear: 2030,
          reductionGoalPercent: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveProfileLocally(profile, authUser);
      }
    } catch (err: any) {
      console.error('Supabase Email sign up error:', err);
      setAuthError(err?.message || 'Could not create Supabase account.');
      throw err;
    }
  };

  const signInGuest = async (customName?: string, customEmail?: string, customOrg?: string) => {
    setAuthError(null);
    try {
      const guestId = `guest_${Date.now()}`;
      const authUser: AuthUser = {
        id: guestId,
        email: customEmail || 'guest@cstack.climate',
        isAnonymous: true,
      };
      const profile: UserProfile = {
        uid: guestId,
        email: customEmail || 'guest@cstack.climate',
        displayName: customName || 'Climate Analyst',
        organization: customOrg || 'CSTACK Workspace',
        preferredRegion: 'IN',
        targetNetZeroYear: 2030,
        reductionGoalPercent: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfileLocally(profile, authUser);
    } catch (err: any) {
      console.error('Guest login error:', err);
      setAuthError('Could not start guest session.');
      throw err;
    }
  };

  const logOut = async () => {
    setAuthError(null);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    } finally {
      setUser(null);
      setUserProfile(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.removeItem(STORAGE_PROFILE_KEY);
      }
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveProfileLocally(updated, user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        isSupabaseConnected,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInGuest,
        logOut,
        updateUserProfile,
        connectSupabaseCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
