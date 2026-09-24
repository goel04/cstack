import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  db,
  doc,
  setDoc,
  getDoc,
  User as FirebaseUser,
} from '../lib/firebase';
import { UserProfile, RegionCode } from '../types/carbon';

export interface AuthUser {
  id: string;
  uid: string;
  email?: string;
  displayName?: string;
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
  const [isSupabaseConnected] = useState<boolean>(false);

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Helper to persist user and profile in React state and localStorage (for instant offline cache)
  const saveProfileLocally = (profile: UserProfile, authUser: AuthUser) => {
    setUser(authUser);
    setUserProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    }
  };

  // Build UserProfile from Firebase User with Firestore sync
  const syncFirebaseUserToProfile = async (fbUser: FirebaseUser, extraMeta?: { name?: string; org?: string }): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    let firestoreData: any = null;

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        firestoreData = snap.data();
      }
    } catch (err) {
      console.warn('Could not fetch user profile from Firestore:', err);
    }

    const fallbackName = extraMeta?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Carbon Analyst';
    const fallbackOrg = extraMeta?.org || 'CSTACK Workspace';

    const profile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: firestoreData?.displayName || fallbackName,
      organization: firestoreData?.organization || fallbackOrg,
      preferredRegion: (firestoreData?.preferredRegion as RegionCode) || 'IN',
      targetNetZeroYear: firestoreData?.targetNetZeroYear || 2030,
      reductionGoalPercent: firestoreData?.reductionGoalPercent || 50,
      createdAt: firestoreData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save/update to Firestore in user's isolated document bucket
    try {
      await setDoc(userDocRef, profile, { merge: true });
    } catch (err) {
      console.warn('Could not persist user document in Firestore:', err);
    }

    const authUser: AuthUser = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: fbUser.email || undefined,
      displayName: profile.displayName,
      isAnonymous: fbUser.isAnonymous,
      user_metadata: {
        full_name: profile.displayName,
        organization: profile.organization,
      },
    };

    saveProfileLocally(profile, authUser);
    return profile;
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    // 1. Initial cached session restore
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
        if (storedUser && storedProfile) {
          setUser(JSON.parse(storedUser));
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.warn('Local session restore notice:', e);
      }
    }

    // 2. Real-time Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await syncFirebaseUserToProfile(currentUser);
      } else {
        // If user logged out of Firebase and there is no active local manual session
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_USER_KEY) : null;
        if (!storedUser) {
          setUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In with real account selection popup
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      // Force account selection so users choose whichever Google account they want
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncFirebaseUserToProfile(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      // If popup was closed by user or cancelled, present friendly error
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in was cancelled.');
      } else {
        setAuthError(err?.message || 'Failed to sign in with Google. Please try again.');
      }
      throw err;
    }
  };

  // Email / Password Sign-In
  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await syncFirebaseUserToProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. If you are new, click "Create Account".');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else {
        setAuthError(err?.message || 'Failed to sign in with email.');
      }
      throw err;
    }
  };

  // Email / Password Sign-Up
  const signUpWithEmail = async (email: string, pass: string, name?: string, org?: string) => {
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        if (name) {
          try {
            await firebaseUpdateProfile(result.user, { displayName: name });
          } catch (e) {
            console.warn('Update profile display name error:', e);
          }
        }
        await syncFirebaseUserToProfile(result.user, { name, org });
      }
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Please choose Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else {
        setAuthError(err?.message || 'Could not create account. Please try again.');
      }
      throw err;
    }
  };

  // Guest sign in fallback
  const signInGuest = async (customName?: string, customEmail?: string, customOrg?: string) => {
    setAuthError(null);
    try {
      const guestId = `guest_${Date.now().toString(36)}`;
      const name = customName || 'Guest Analyst';
      const email = customEmail || `guest_${Date.now().toString(36)}@cstack.climate`;
      const org = customOrg || 'Guest Workspace';

      const authUser: AuthUser = {
        id: guestId,
        uid: guestId,
        email,
        displayName: name,
        isAnonymous: true,
        user_metadata: { full_name: name, organization: org },
      };

      const profile: UserProfile = {
        uid: guestId,
        email,
        displayName: name,
        organization: org,
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
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout notice:', e);
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

    // Save locally
    saveProfileLocally(updated, user);

    // Save to Firestore under isolated user document
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updated, { merge: true });
    } catch (err) {
      console.warn('Failed to persist profile update to Firestore:', err);
    }
  };

  const connectSupabaseCredentials = (_url: string, _key: string): boolean => {
    return true;
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
