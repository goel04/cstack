import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  db,
  User,
} from '../lib/firebase';
import { UserProfile, RegionCode } from '../types/carbon';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string, org?: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sync or create user profile document in Firestore
  const syncUserProfile = async (firebaseUser: User, extraData?: { name?: string; org?: string }) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
      } else {
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'guest@cstack.climate',
          displayName:
            extraData?.name ||
            firebaseUser.displayName ||
            (firebaseUser.isAnonymous ? 'Guest Climate Analyst' : 'Sustainability Lead'),
          organization: extraData?.org || 'CSTACK Enterprise Workspace',
          preferredRegion: 'IN',
          targetNetZeroYear: 2030,
          reductionGoalPercent: 42,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err: any) {
      console.warn('Could not sync user profile in Firestore:', err);
      // Fallback local profile if offline or rules pending
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'user@cstack.climate',
        displayName: firebaseUser.displayName || 'Sustainability Lead',
        organization: extraData?.org || 'CSTACK Workspace',
        preferredRegion: 'IN',
        targetNetZeroYear: 2030,
        reductionGoalPercent: 42,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
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
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password. Please check your credentials.');
      } else {
        setAuthError(err?.message || 'Failed to sign in.');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string, org?: string) => {
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
        await syncUserProfile(result.user, { name, org });
      }
    } catch (err: any) {
      console.error('Email sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err?.message || 'Failed to register account.');
      }
      throw err;
    }
  };

  const signInGuest = async () => {
    setAuthError(null);
    try {
      const result = await signInAnonymously(auth);
      if (result.user) {
        await syncUserProfile(result.user, {
          name: 'Demo Climate Analyst',
          org: 'Guest Exploration Lab',
        });
      }
    } catch (err: any) {
      console.error('Guest sign in error:', err);
      setAuthError(err?.message || 'Failed to start guest session.');
      throw err;
    }
  };

  const logOut = async () => {
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const userRef = doc(db, 'users', user.uid);
      const updated = {
        ...userProfile,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updated, { merge: true });
      setUserProfile(updated as UserProfile);
    } catch (err: any) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInGuest,
        logOut,
        updateUserProfile,
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
