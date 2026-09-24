import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { HomePage } from './pages/HomePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { AboutPage } from './pages/AboutPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AccountingPage } from './pages/AccountingPage';
import { ReportingPage } from './pages/ReportingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivePage, CalculatorState } from './types/carbon';

function MainApp() {
  const { user, userProfile, logOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [modeledOffsetTonnes, setModeledOffsetTonnes] = useState<number>(24.6);
  const [loadedCalculatorState, setLoadedCalculatorState] = useState<CalculatorState | null>(null);

  const handleNavigate = (page: ActivePage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadCalculation = (state: CalculatorState) => {
    setLoadedCalculatorState(state);
    setCurrentPage('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Banner when logged in */}
      {user && (
        <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Connected to Supabase as{' '}
            <strong className="text-white">
              {userProfile?.displayName || user.email || 'Climate Analyst'}
            </strong>{' '}
            ({userProfile?.organization || 'CSTACK Workspace'})
          </span>
          <button
            onClick={() => handleNavigate('dashboard')}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline ml-2 text-[11px]"
          >
            Open Dashboard
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={logOut}
            className="text-slate-400 hover:text-white text-[11px] hover:underline"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentPage === 'calculator' && (
          <CalculatorPage
            onNavigate={handleNavigate}
            onSetModeledTonnes={setModeledOffsetTonnes}
            loadedState={loadedCalculatorState}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onLoadCalculationIntoCalculator={handleLoadCalculation}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {currentPage === 'marketplace' && (
          <MarketplacePage
            onNavigate={handleNavigate}
            suggestedOffsetTonnes={modeledOffsetTonnes}
          />
        )}

        {currentPage === 'accounting' && (
          <AccountingPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'reporting' && (
          <ReportingPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Login / Auth Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccessLogin={() => {
          setIsLoginOpen(false);
          // If on home, let's offer to take them to their personal dashboard
          if (currentPage === 'home') {
            handleNavigate('dashboard');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
