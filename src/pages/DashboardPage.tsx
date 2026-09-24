import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Globe,
  Layers,
  Leaf,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingDown,
  User,
  Building,
  Target,
  FileText,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  SavedCalculationRecord,
  UserActivityRecord,
  UserOffsetRecord,
  ActivePage,
  CalculatorState,
  RegionCode,
} from '../types/carbon';
import {
  subscribeUserCalculations,
  deleteUserCalculation,
  subscribeUserActivities,
  addUserActivity,
  deleteUserActivity,
  subscribeUserOffsets,
  addUserOffsetRetirement,
} from '../lib/userDataService';

interface DashboardPageProps {
  onNavigate: (page: ActivePage) => void;
  onLoadCalculationIntoCalculator?: (state: CalculatorState) => void;
  onOpenLogin: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onLoadCalculationIntoCalculator,
  onOpenLogin,
}) => {
  const { user, userProfile, updateUserProfile, logOut, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'calculations' | 'activities' | 'offsets' | 'settings'>('calculations');
  const [calculations, setCalculations] = useState<SavedCalculationRecord[]>([]);
  const [activities, setActivities] = useState<UserActivityRecord[]>([]);
  const [offsets, setOffsets] = useState<UserOffsetRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // New Activity Modal state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityScope, setActivityScope] = useState<'Scope 1' | 'Scope 2' | 'Scope 3'>('Scope 2');
  const [activityCategory, setActivityCategory] = useState<'electricity' | 'transportation' | 'flights' | 'fuel' | 'waste' | 'other'>('electricity');
  const [activityFacility, setActivityFacility] = useState('Headquarters');
  const [activityValue, setActivityValue] = useState<number>(1000);
  const [activityUnit, setActivityUnit] = useState('kWh');
  const [activityNotes, setActivityNotes] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // Settings state
  const [editName, setEditName] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [editRegion, setEditRegion] = useState<RegionCode>('IN');
  const [editTargetYear, setEditTargetYear] = useState<number>(2030);
  const [editGoalPercent, setEditGoalPercent] = useState<number>(42);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Sample seed for new users if empty
  const [isSeeding, setIsSeeding] = useState(false);

  // Sync profile edits
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.displayName || '');
      setEditOrg(userProfile.organization || '');
      setEditRegion(userProfile.preferredRegion || 'IN');
      setEditTargetYear(userProfile.targetNetZeroYear || 2030);
      setEditGoalPercent(userProfile.reductionGoalPercent || 42);
    }
  }, [userProfile]);

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    const unsubCalcs = subscribeUserCalculations(
      user.uid,
      (records) => {
        setCalculations(records);
        setIsLoadingData(false);
      },
      (err) => {
        console.warn('Calc subscription error:', err);
        setIsLoadingData(false);
      }
    );

    const unsubActs = subscribeUserActivities(
      user.uid,
      (acts) => {
        setActivities(acts);
      },
      (err) => console.warn('Activity subscription error:', err)
    );

    const unsubOffsets = subscribeUserOffsets(
      user.uid,
      (offs) => {
        setOffsets(offs);
      },
      (err) => console.warn('Offset subscription error:', err)
    );

    return () => {
      unsubCalcs();
      unsubActs();
      unsubOffsets();
    };
  }, [user]);

  // Aggregate stats
  const totalModeledTonnes = calculations.reduce((acc, c) => acc + c.totalTonnesCO2e, 0);
  const totalActivityKg = activities.reduce((acc, a) => acc + a.kgCO2e, 0);
  const totalActivityTonnes = Number((totalActivityKg / 1000).toFixed(2));
  const totalOffsetsRetired = Number(offsets.reduce((acc, o) => acc + o.tonnes, 0).toFixed(2));

  const totalFootprintTonnes = calculations.length > 0 
    ? Number(totalModeledTonnes.toFixed(2)) 
    : totalActivityTonnes;
  const netResidualTonnes = Math.max(0, Number((totalFootprintTonnes - totalOffsetsRetired).toFixed(2)));

  // Handle deleting calculation
  const handleDeleteCalc = async (id: string) => {
    if (!user) return;
    try {
      await deleteUserCalculation(user.uid, id);
    } catch (err) {
      console.error('Failed to delete calculation:', err);
    }
  };

  // Handle deleting activity
  const handleDeleteActivity = async (id: string) => {
    if (!user) return;
    try {
      await deleteUserActivity(user.uid, id);
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  // Handle adding new activity
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingActivity(true);
    try {
      // Calculate emission based on unit & category
      let factor = 0.716; // default electricity
      if (activityCategory === 'fuel') factor = 2.68; // diesel/petrol approx
      else if (activityCategory === 'transportation') factor = 0.17; // km
      else if (activityCategory === 'flights') factor = 0.15; // pax km
      else if (activityCategory === 'waste') factor = 0.52; // kg waste

      const calculatedKg = Number((activityValue * factor).toFixed(2));

      await addUserActivity(user.uid, {
        date: activityDate,
        scope: activityScope,
        category: activityCategory,
        facility: activityFacility,
        metricValue: activityValue,
        metricUnit: activityUnit,
        kgCO2e: calculatedKg,
        notes: activityNotes,
      });

      setIsActivityModalOpen(false);
      setActivityNotes('');
    } catch (err) {
      console.error('Failed to add activity:', err);
    } finally {
      setIsSavingActivity(false);
    }
  };

  // Seed sample starter data for new users to explore
  const handleSeedStarterData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      // 1. Add sample activity 1 (Grid Electricity)
      await addUserActivity(user.uid, {
        date: '2026-09-01',
        scope: 'Scope 2',
        category: 'electricity',
        facility: 'Main Tech Center',
        metricValue: 4200,
        metricUnit: 'kWh',
        kgCO2e: 3007.2,
        notes: 'Monthly utility meter reading (India Grid CEA v19)',
      });

      // 2. Add sample activity 2 (Executive flights)
      await addUserActivity(user.uid, {
        date: '2026-09-12',
        scope: 'Scope 3',
        category: 'flights',
        facility: 'Global Business Dev',
        metricValue: 6800,
        metricUnit: 'km',
        kgCO2e: 1020.0,
        notes: 'Round-trip DEL-LHR climate summit delegation',
      });

      // 3. Add sample offset retirement
      await addUserOffsetRetirement(user.uid, {
        projectName: 'Charm Industrial Pyrolysis Bio-Oil Sequestration',
        projectType: 'Permanent Geological Removal',
        registry: 'Isometric',
        serialNumber: 'ISO-2026-CDR-994182',
        tonnes: 5.0,
        costUsd: 1400,
      });
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingSettings(true);
    try {
      await updateUserProfile({
        displayName: editName,
        organization: editOrg,
        preferredRegion: editRegion,
        targetNetZeroYear: Number(editTargetYear),
        reductionGoalPercent: Number(editGoalPercent),
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Export ledger to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Type', 'ID', 'Date/Created', 'Category/Project', 'Metric Value', 'Unit', 'Emissions (tCO2e)', 'Notes/Serial'],
      ...calculations.map((c) => [
        'Assessment',
        c.id,
        c.createdAt,
        c.title,
        '-',
        '-',
        c.totalTonnesCO2e.toString(),
        `Offset req: ${c.offsetRequirementTonnes} tCO2e`,
      ]),
      ...activities.map((a) => [
        'Activity',
        a.id,
        a.date,
        `${a.scope} - ${a.category}`,
        a.metricValue.toString(),
        a.metricUnit,
        (a.kgCO2e / 1000).toFixed(3),
        a.notes || a.facility,
      ]),
      ...offsets.map((o) => [
        'Offset Retirement',
        o.id,
        o.retiredAt,
        o.projectName,
        o.tonnes.toString(),
        'tCO2e',
        (-o.tonnes).toString(),
        o.serialNumber,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CSTACK_Carbon_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Non-authenticated user view
  if (!user && !authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Firestore Encrypted Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
            Sign In to Access Your Personal Carbon Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Your assessments, activity entries, and certified carbon retirements are securely stored and synced in your private Firebase Firestore database.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Sign In or Create Account</span>
          </button>
          <button
            onClick={() => onNavigate('calculator')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-sm font-semibold transition-all"
          >
            Launch Calculator First
          </button>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Saved Assessments</h3>
            <p className="text-xs text-slate-500">
              Save and compare footprint calculations over time with historical breakdowns.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <Layers className="w-5 h-5 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">Activity Log & Scopes</h3>
            <p className="text-xs text-slate-500">
              Granular Scope 1, 2, and 3 logs for facilities, vehicle fleets, and business travel.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
            <h3 className="text-sm font-bold text-slate-900">Proof of Retirement</h3>
            <p className="text-xs text-slate-500">
              Store serial numbers and certificates for CDR credits from Isometric, Puro, and Verra.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner: User Identity & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-display font-bold text-xl shrink-0 shadow-md">
            {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-950">
                {userProfile?.displayName || 'Sustainability Lead'}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                {userProfile?.organization || 'CSTACK Enterprise'}
              </span>
              {user?.isAnonymous && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  Guest Session
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{user?.email || 'Authenticated User'}</span>
              <span>•</span>
              <span>Target Net Zero: <strong>{userProfile?.targetNetZeroYear || 2030}</strong></span>
              <span>•</span>
              <span>Region Grid: <strong>{userProfile?.preferredRegion || 'IN'} (CEA v19)</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('calculator')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Assessment</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Ledger</span>
          </button>
          <button
            onClick={logOut}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Tracked Footprint</span>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {totalFootprintTonnes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">tCO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Across {calculations.length} assessments & {activities.length} activity entries
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Offsets Retired</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-800">
              {totalOffsetsRetired.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">tCO₂e</span>
          </div>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Serialized on public registries</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Net Residual Emissions</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {netResidualTonnes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">tCO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Residual needing neutralization
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Target Reduction Goal</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-display font-bold text-indigo-900">
              {userProfile?.reductionGoalPercent || 42}%
            </span>
            <span className="text-xs text-slate-500 font-medium">by {userProfile?.targetNetZeroYear || 2030}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, totalOffsetsRetired > 0 ? (totalOffsetsRetired / (totalFootprintTonnes || 1)) * 100 : 25))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'calculations', label: `Saved Assessments (${calculations.length})`, icon: BarChart3 },
          { id: 'activities', label: `Activity Ledger (${activities.length})`, icon: Layers },
          { id: 'offsets', label: `Offset Retirements (${offsets.length})`, icon: ShieldCheck },
          { id: 'settings', label: 'Organization & Climate Settings', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SAVED CALCULATIONS */}
      {activeTab === 'calculations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">
                Saved Carbon Footprint Assessments
              </h2>
              <p className="text-xs text-slate-500">
                Snapshots captured from the CSTACK calculation engine, stored in Supabase.
              </p>
            </div>
            <button
              onClick={() => onNavigate('calculator')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Calculation</span>
            </button>
          </div>

          {calculations.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Saved Assessments Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run an emission model in our Calculator and click "Save to Dashboard" to record it permanently.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => onNavigate('calculator')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
                >
                  Run Calculator Now
                </button>
                <button
                  onClick={handleSeedStarterData}
                  disabled={isSeeding}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  {isSeeding ? 'Populating...' : 'Load Sample Data'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calculations.map((calc) => (
                <div
                  key={calc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{calc.title}</h3>
                        <p className="text-[11px] text-slate-400">
                          {new Date(calc.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCalc(calc.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Total Footprint:</span>
                        <span className="text-base font-bold text-slate-900">
                          {calc.totalTonnesCO2e} <span className="text-xs font-normal">tCO₂e</span>
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500">Offset Requirement:</span>
                        <span className="font-semibold text-emerald-800">
                          {calc.offsetRequirementTonnes} tCO₂e
                        </span>
                      </div>
                    </div>

                    {/* Breakdown mini bars */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Category Share
                      </span>
                      <div className="space-y-1">
                        {calc.breakdown.map((b) => (
                          <div key={b.category} className="space-y-0.5">
                            <div className="flex justify-between text-[11px] text-slate-600">
                              <span>{b.label}</span>
                              <span className="font-medium">{b.tCO2e} t ({b.percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  b.category === 'electricity'
                                    ? 'bg-amber-500'
                                    : b.category === 'transportation'
                                    ? 'bg-sky-500'
                                    : b.category === 'flights'
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.min(100, b.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {onLoadCalculationIntoCalculator && (
                      <button
                        onClick={() => {
                          onLoadCalculationIntoCalculator(calc.inputsSnapshot);
                          onNavigate('calculator');
                        }}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                      >
                        <span>Load in Calculator</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate('marketplace')}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Find Offsets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVITY LEDGER */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">
                Activity Emissions Ledger (Scope 1, 2 & 3)
              </h2>
              <p className="text-xs text-slate-500">
                Granular emissions entries recorded for utility bills, fleets, and travel.
              </p>
            </div>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Activity</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Activities Logged Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Log your electricity meter reading, fuel consumption, or flights to track operational carbon.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
                >
                  Log First Activity
                </button>
                <button
                  onClick={handleSeedStarterData}
                  disabled={isSeeding}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  {isSeeding ? 'Populating...' : 'Load Sample Activities'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Scope</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Facility / Context</th>
                      <th className="p-3.5">Metric Quantity</th>
                      <th className="p-3.5">Emissions</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-medium whitespace-nowrap">{act.date}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase ${
                              act.scope === 'Scope 1'
                                ? 'bg-amber-100 text-amber-900'
                                : act.scope === 'Scope 2'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {act.scope}
                          </span>
                        </td>
                        <td className="p-3.5 capitalize">{act.category}</td>
                        <td className="p-3.5 text-slate-600">{act.facility}</td>
                        <td className="p-3.5 font-mono">
                          {act.metricValue.toLocaleString()} {act.metricUnit}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-950">
                            {(act.kgCO2e / 1000).toFixed(3)}
                          </span>{' '}
                          <span className="text-slate-400">tCO₂e</span>
                          <span className="text-[10px] text-slate-400 block">
                            ({act.kgCO2e.toLocaleString()} kg)
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate">
                          {act.notes || '—'}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OFFSET PORTFOLIO */}
      {activeTab === 'offsets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">
                Offset Retirements & Serial Registry Certificates
              </h2>
              <p className="text-xs text-slate-500">
                Permanent carbon removals and certified credits retired under your account.
              </p>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Retire from Marketplace</span>
            </button>
          </div>

          {offsets.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Offset Retirements on File</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Neutralize residual emissions by purchasing verified CDR credits from our audited marketplace.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
                >
                  Explore CDR Marketplace
                </button>
                <button
                  onClick={handleSeedStarterData}
                  disabled={isSeeding}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  {isSeeding ? 'Populating...' : 'Simulate Sample Retirement'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offsets.map((off) => (
                <div
                  key={off.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                      {off.registry}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {off.tonnes} tCO₂e Retired
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{off.projectName}</h3>
                    <p className="text-xs text-slate-500">{off.projectType}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Serial: <strong>{off.serialNumber}</strong></span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      Retired on{' '}
                      {new Date(off.retiredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-emerald-700 font-medium">Audit-Ready</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Personal & Enterprise Climate Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Customize your baseline assumptions, grid emission factors, and net-zero targets.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile and climate targets saved to Firestore.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Organization / Company Name
              </label>
              <input
                type="text"
                value={editOrg}
                onChange={(e) => setEditOrg(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Default Regional Grid Factor
                </label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value as RegionCode)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="IN">India (CEA v19 - 0.716 kgCO₂e/kWh)</option>
                  <option value="US">United States (eGRID - 0.386 kgCO₂e/kWh)</option>
                  <option value="GB">United Kingdom (DESNZ - 0.207 kgCO₂e/kWh)</option>
                  <option value="EU">European Union (EEA - 0.251 kgCO₂e/kWh)</option>
                  <option value="SG">Singapore (EMA - 0.405 kgCO₂e/kWh)</option>
                  <option value="AU">Australia (DCCEEW - 0.680 kgCO₂e/kWh)</option>
                  <option value="GLOBAL">Global Average (IEA - 0.475 kgCO₂e/kWh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Net Zero Year
                </label>
                <input
                  type="number"
                  min={2026}
                  max={2050}
                  value={editTargetYear}
                  onChange={(e) => setEditTargetYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Decarbonization Reduction Goal (% by target year)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={editGoalPercent}
                  onChange={(e) => setEditGoalPercent(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <span className="text-xs font-bold text-slate-900 w-12 text-right">
                  {editGoalPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                SBTi 1.5°C pathway recommends $\ge 42\%$ absolute reduction by 2030 from base year.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 disabled:opacity-70"
              >
                {isSavingSettings ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LOG ACTIVITY MODAL */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-display font-bold text-slate-950">
                  Log Granular Activity Emission
                </h3>
                <p className="text-xs text-slate-500">Record an operational emission event into your ledger.</p>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Activity Date
                  </label>
                  <input
                    type="date"
                    required
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Scope
                  </label>
                  <select
                    value={activityScope}
                    onChange={(e) => setActivityScope(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Scope 1">Scope 1 (Direct Fuel/Fleet)</option>
                    <option value="Scope 2">Scope 2 (Purchased Electricity)</option>
                    <option value="Scope 3">Scope 3 (Travel & Value Chain)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={activityCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setActivityCategory(cat);
                      if (cat === 'electricity') setActivityUnit('kWh');
                      else if (cat === 'fuel') setActivityUnit('Liters');
                      else if (cat === 'transportation' || cat === 'flights') setActivityUnit('km');
                      else if (cat === 'waste') setActivityUnit('kg');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="electricity">Electricity</option>
                    <option value="fuel">Stationary Fuel (LPG/Diesel)</option>
                    <option value="transportation">Ground Commute / Fleet</option>
                    <option value="flights">Business Air Travel</option>
                    <option value="waste">Solid Waste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Facility / Site
                  </label>
                  <input
                    type="text"
                    required
                    value={activityFacility}
                    onChange={(e) => setActivityFacility(e.target.value)}
                    placeholder="e.g. Mumbai Office, Fleet A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Measured Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    value={activityValue}
                    onChange={(e) => setActivityValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={activityUnit}
                    onChange={(e) => setActivityUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Audit Reference (Optional)
                </label>
                <input
                  type="text"
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="Utility invoice # or flight ticket code"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingActivity}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isSavingActivity ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Save to Ledger</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
