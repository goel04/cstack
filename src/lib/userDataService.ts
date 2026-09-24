import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from './firebase';
import {
  CalculationResult,
  SavedCalculationRecord,
  UserActivityRecord,
  UserOffsetRecord,
} from '../types/carbon';

/**
 * Calculations Collection: /users/{userId}/calculations/{calcId}
 */
export const saveUserCalculation = async (
  userId: string,
  calc: CalculationResult,
  customTitle?: string
): Promise<string> => {
  const calcId = `calc_${Date.now()}`;
  const docRef = doc(db, 'users', userId, 'calculations', calcId);
  const now = new Date().toISOString();

  const record: SavedCalculationRecord = {
    id: calcId,
    title: customTitle || `Assessment ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    totalKgCO2e: calc.totalKgCO2e,
    totalTonnesCO2e: calc.totalTonnesCO2e,
    offsetRequirementTonnes: calc.offsetRequirementTonnes,
    breakdown: calc.breakdown,
    inputsSnapshot: calc.inputsSnapshot,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, record);
  return calcId;
};

export const subscribeUserCalculations = (
  userId: string,
  onUpdate: (records: SavedCalculationRecord[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, 'users', userId, 'calculations');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SavedCalculationRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as SavedCalculationRecord);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Error subscribing to user calculations:', err);
      if (onError) onError(err);
    }
  );
};

export const deleteUserCalculation = async (userId: string, calcId: string) => {
  const docRef = doc(db, 'users', userId, 'calculations', calcId);
  await deleteDoc(docRef);
};

/**
 * Activity Records Collection: /users/{userId}/activities/{activityId}
 */
export const addUserActivity = async (
  userId: string,
  activity: Omit<UserActivityRecord, 'id' | 'createdAt'>
): Promise<string> => {
  const actId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const docRef = doc(db, 'users', userId, 'activities', actId);
  const now = new Date().toISOString();

  const fullRecord: UserActivityRecord = {
    ...activity,
    id: actId,
    createdAt: now,
  };

  await setDoc(docRef, fullRecord);
  return actId;
};

export const subscribeUserActivities = (
  userId: string,
  onUpdate: (activities: UserActivityRecord[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, 'users', userId, 'activities');
  const q = query(colRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserActivityRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as UserActivityRecord);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Error subscribing to user activities:', err);
      if (onError) onError(err);
    }
  );
};

export const deleteUserActivity = async (userId: string, activityId: string) => {
  const docRef = doc(db, 'users', userId, 'activities', activityId);
  await deleteDoc(docRef);
};

/**
 * Offset Retirements Collection: /users/{userId}/offsets/{offsetId}
 */
export const addUserOffsetRetirement = async (
  userId: string,
  offset: Omit<UserOffsetRecord, 'id' | 'retiredAt'>
): Promise<string> => {
  const offsetId = `retire_${Date.now()}`;
  const docRef = doc(db, 'users', userId, 'offsets', offsetId);
  const now = new Date().toISOString();

  const fullRecord: UserOffsetRecord = {
    ...offset,
    id: offsetId,
    retiredAt: now,
  };

  await setDoc(docRef, fullRecord);
  return offsetId;
};

export const subscribeUserOffsets = (
  userId: string,
  onUpdate: (offsets: UserOffsetRecord[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, 'users', userId, 'offsets');
  const q = query(colRef, orderBy('retiredAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserOffsetRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as UserOffsetRecord);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Error subscribing to user offsets:', err);
      if (onError) onError(err);
    }
  );
};
