import {
  CalculationResult,
  SavedCalculationRecord,
  UserActivityRecord,
  UserOffsetRecord,
} from '../types/carbon';
import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from './firebase';

const STORAGE_CALC_KEY = 'cstack_user_calculations';
const STORAGE_ACT_KEY = 'cstack_user_activities';
const STORAGE_OFFSET_KEY = 'cstack_user_offsets';

// Local storage helpers - isolated by userId
const getLocalData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

const setLocalData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Local storage write error:', err);
  }
};

/**
 * Calculations - Scoped to users/{userId}/calculations/{calcId}
 */
export const saveUserCalculation = async (
  userId: string,
  calc: CalculationResult,
  customTitle?: string
): Promise<string> => {
  const calcId = `calc_${Date.now()}`;
  const now = new Date().toISOString();

  const record: SavedCalculationRecord = {
    id: calcId,
    title:
      customTitle ||
      `Assessment ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`,
    totalKgCO2e: calc.totalKgCO2e,
    totalTonnesCO2e: calc.totalTonnesCO2e,
    offsetRequirementTonnes: calc.offsetRequirementTonnes,
    breakdown: calc.breakdown,
    inputsSnapshot: calc.inputsSnapshot,
    createdAt: now,
    updatedAt: now,
  };

  // Always save to user-specific local storage bucket for instant reactive UI
  const current = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
  setLocalData(`${STORAGE_CALC_KEY}_${userId}`, [record, ...current]);

  // Persist into user-specific Firestore subcollection
  try {
    const calcDocRef = doc(db, 'users', userId, 'calculations', calcId);
    await setDoc(calcDocRef, record);
  } catch (err) {
    console.warn('Firestore calculation write warning:', err);
  }

  return calcId;
};

export const subscribeUserCalculations = (
  userId: string,
  onUpdate: (records: SavedCalculationRecord[]) => void,
  _onError?: (error: any) => void
) => {
  // 1. Instantly deliver cached user local records
  const localList = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
  onUpdate(localList);

  // 2. Real-time Firestore listener on user's personal calculations subcollection
  let unsubFirestore = () => {};
  try {
    const colRef = collection(db, 'users', userId, 'calculations');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SavedCalculationRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as SavedCalculationRecord);
          });
          onUpdate(list);
          setLocalData(`${STORAGE_CALC_KEY}_${userId}`, list);
        }
      },
      (error) => {
        console.warn('Firestore calculation subscribe error:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore subscription init notice:', err);
  }

  // Cross-tab storage synchronization
  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_CALC_KEY}_${userId}`) {
      const updated = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
      onUpdate(updated);
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
    unsubFirestore();
  };
};

export const deleteUserCalculation = async (userId: string, calcId: string) => {
  const current = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
  const filtered = current.filter((c) => c.id !== calcId);
  setLocalData(`${STORAGE_CALC_KEY}_${userId}`, filtered);

  try {
    const calcDocRef = doc(db, 'users', userId, 'calculations', calcId);
    await deleteDoc(calcDocRef);
  } catch (err) {
    console.warn('Firestore calculation delete notice:', err);
  }
};

/**
 * Activity Records - Scoped to users/{userId}/activities/{activityId}
 */
export const addUserActivity = async (
  userId: string,
  activity: Omit<UserActivityRecord, 'id' | 'createdAt'>
): Promise<string> => {
  const actId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const fullRecord: UserActivityRecord = {
    ...activity,
    id: actId,
    createdAt: now,
  };

  const current = getLocalData<UserActivityRecord>(`${STORAGE_ACT_KEY}_${userId}`);
  setLocalData(`${STORAGE_ACT_KEY}_${userId}`, [fullRecord, ...current]);

  try {
    const actDocRef = doc(db, 'users', userId, 'activities', actId);
    await setDoc(actDocRef, fullRecord);
  } catch (err) {
    console.warn('Firestore activity write notice:', err);
  }

  return actId;
};

export const subscribeUserActivities = (
  userId: string,
  onUpdate: (activities: UserActivityRecord[]) => void,
  _onError?: (error: any) => void
) => {
  const localList = getLocalData<UserActivityRecord>(`${STORAGE_ACT_KEY}_${userId}`);
  onUpdate(localList);

  let unsubFirestore = () => {};
  try {
    const colRef = collection(db, 'users', userId, 'activities');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: UserActivityRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as UserActivityRecord);
          });
          onUpdate(list);
          setLocalData(`${STORAGE_ACT_KEY}_${userId}`, list);
        }
      },
      (error) => {
        console.warn('Firestore activity subscribe notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore activity listener init:', err);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_ACT_KEY}_${userId}`) {
      const updated = getLocalData<UserActivityRecord>(`${STORAGE_ACT_KEY}_${userId}`);
      onUpdate(updated);
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
    unsubFirestore();
  };
};

export const deleteUserActivity = async (userId: string, activityId: string) => {
  const current = getLocalData<UserActivityRecord>(`${STORAGE_ACT_KEY}_${userId}`);
  const filtered = current.filter((a) => a.id !== activityId);
  setLocalData(`${STORAGE_ACT_KEY}_${userId}`, filtered);

  try {
    const actDocRef = doc(db, 'users', userId, 'activities', activityId);
    await deleteDoc(actDocRef);
  } catch (err) {
    console.warn('Firestore activity delete notice:', err);
  }
};

/**
 * Offset Retirements - Scoped to users/{userId}/offsets/{offsetId}
 */
export const addUserOffsetRetirement = async (
  userId: string,
  offset: Omit<UserOffsetRecord, 'id' | 'retiredAt'>
): Promise<string> => {
  const offsetId = `retire_${Date.now()}`;
  const now = new Date().toISOString();

  const fullRecord: UserOffsetRecord = {
    ...offset,
    id: offsetId,
    retiredAt: now,
  };

  const current = getLocalData<UserOffsetRecord>(`${STORAGE_OFFSET_KEY}_${userId}`);
  setLocalData(`${STORAGE_OFFSET_KEY}_${userId}`, [fullRecord, ...current]);

  try {
    const offsetDocRef = doc(db, 'users', userId, 'offsets', offsetId);
    await setDoc(offsetDocRef, fullRecord);
  } catch (err) {
    console.warn('Firestore offset write notice:', err);
  }

  return offsetId;
};

export const subscribeUserOffsets = (
  userId: string,
  onUpdate: (offsets: UserOffsetRecord[]) => void,
  _onError?: (error: any) => void
) => {
  const localList = getLocalData<UserOffsetRecord>(`${STORAGE_OFFSET_KEY}_${userId}`);
  onUpdate(localList);

  let unsubFirestore = () => {};
  try {
    const colRef = collection(db, 'users', userId, 'offsets');
    const q = query(colRef, orderBy('retiredAt', 'desc'));
    unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: UserOffsetRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as UserOffsetRecord);
          });
          onUpdate(list);
          setLocalData(`${STORAGE_OFFSET_KEY}_${userId}`, list);
        }
      },
      (error) => {
        console.warn('Firestore offset subscribe notice:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore offset listener init:', err);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_OFFSET_KEY}_${userId}`) {
      const updated = getLocalData<UserOffsetRecord>(`${STORAGE_OFFSET_KEY}_${userId}`);
      onUpdate(updated);
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
    unsubFirestore();
  };
};
