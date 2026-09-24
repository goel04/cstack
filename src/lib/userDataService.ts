import {
  CalculationResult,
  SavedCalculationRecord,
  UserActivityRecord,
  UserOffsetRecord,
} from '../types/carbon';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_CALC_KEY = 'cstack_user_calculations';
const STORAGE_ACT_KEY = 'cstack_user_activities';
const STORAGE_OFFSET_KEY = 'cstack_user_offsets';

// Local storage helpers
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
 * Calculations
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
    title: customTitle || `Assessment ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    totalKgCO2e: calc.totalKgCO2e,
    totalTonnesCO2e: calc.totalTonnesCO2e,
    offsetRequirementTonnes: calc.offsetRequirementTonnes,
    breakdown: calc.breakdown,
    inputsSnapshot: calc.inputsSnapshot,
    createdAt: now,
    updatedAt: now,
  };

  // Always save to user local records for instant sync
  const current = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
  setLocalData(`${STORAGE_CALC_KEY}_${userId}`, [record, ...current]);

  // If Supabase table exists and is configured, write to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('calculations').upsert({
        id: calcId,
        user_id: userId,
        title: record.title,
        total_kg_co2e: record.totalKgCO2e,
        total_tonnes_co2e: record.totalTonnesCO2e,
        offset_requirement_tonnes: record.offsetRequirementTonnes,
        breakdown: record.breakdown,
        inputs_snapshot: record.inputsSnapshot,
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.warn('Supabase sync skipped/deferred:', err);
    }
  }

  return calcId;
};

export const subscribeUserCalculations = (
  userId: string,
  onUpdate: (records: SavedCalculationRecord[]) => void,
  _onError?: (error: any) => void
) => {
  // Initial load from local store
  const localList = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
  onUpdate(localList);

  // If Supabase is connected, try to query
  if (isSupabaseConfigured()) {
    supabase
      .from('calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: SavedCalculationRecord[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            totalKgCO2e: Number(d.total_kg_co2e),
            totalTonnesCO2e: Number(d.total_tonnes_co2e),
            offsetRequirementTonnes: Number(d.offset_requirement_tonnes),
            breakdown: d.breakdown,
            inputsSnapshot: d.inputs_snapshot,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
          onUpdate(mapped);
          setLocalData(`${STORAGE_CALC_KEY}_${userId}`, mapped);
        }
      });
  }

  // Polling / storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_CALC_KEY}_${userId}`) {
      const updated = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
      onUpdate(updated);
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
};

export const deleteUserCalculation = async (userId: string, calcId: string) => {
  const current = getLocalData<SavedCalculationRecord>(`${STORAGE_CALC_KEY}_${userId}`);
  const filtered = current.filter((c) => c.id !== calcId);
  setLocalData(`${STORAGE_CALC_KEY}_${userId}`, filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('calculations').delete().eq('id', calcId).eq('user_id', userId);
    } catch (err) {
      console.warn('Could not delete from Supabase:', err);
    }
  }
};

/**
 * Activity Records
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

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('activities').upsert({
        id: actId,
        user_id: userId,
        scope: fullRecord.scope,
        category: fullRecord.category,
        facility: fullRecord.facility,
        metric_value: fullRecord.metricValue,
        metric_unit: fullRecord.metricUnit,
        kg_co2e: fullRecord.kgCO2e,
        notes: fullRecord.notes,
        date: fullRecord.date,
        created_at: now,
      });
    } catch (err) {
      console.warn('Supabase activity sync skipped:', err);
    }
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

  if (isSupabaseConfigured()) {
    supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: UserActivityRecord[] = data.map((d: any) => ({
            id: d.id,
            scope: d.scope,
            category: d.category,
            facility: d.facility || 'Main Facility',
            metricValue: Number(d.metric_value || d.amount || 0),
            metricUnit: d.metric_unit || d.unit || 'units',
            kgCO2e: Number(d.kg_co2e || 0),
            notes: d.notes,
            date: d.date,
            createdAt: d.created_at,
          }));
          onUpdate(mapped);
          setLocalData(`${STORAGE_ACT_KEY}_${userId}`, mapped);
        }
      });
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
  };
};

export const deleteUserActivity = async (userId: string, activityId: string) => {
  const current = getLocalData<UserActivityRecord>(`${STORAGE_ACT_KEY}_${userId}`);
  const filtered = current.filter((a) => a.id !== activityId);
  setLocalData(`${STORAGE_ACT_KEY}_${userId}`, filtered);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('activities').delete().eq('id', activityId).eq('user_id', userId);
    } catch (err) {
      console.warn('Could not delete from Supabase:', err);
    }
  }
};

/**
 * Offset Retirements
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

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('offsets').upsert({
        id: offsetId,
        user_id: userId,
        project_name: fullRecord.projectName,
        project_type: fullRecord.projectType,
        registry: fullRecord.registry,
        serial_number: fullRecord.serialNumber,
        tonnes: fullRecord.tonnes,
        cost_usd: fullRecord.costUsd,
        retired_at: now,
      });
    } catch (err) {
      console.warn('Supabase offset sync skipped:', err);
    }
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

  if (isSupabaseConfigured()) {
    supabase
      .from('offsets')
      .select('*')
      .eq('user_id', userId)
      .order('retired_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: UserOffsetRecord[] = data.map((d: any) => ({
            id: d.id,
            projectName: d.project_name,
            projectType: d.project_type,
            registry: d.registry,
            serialNumber: d.serial_number,
            tonnes: Number(d.tonnes),
            costUsd: Number(d.cost_usd),
            retiredAt: d.retired_at,
          }));
          onUpdate(mapped);
          setLocalData(`${STORAGE_OFFSET_KEY}_${userId}`, mapped);
        }
      });
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
  };
};
