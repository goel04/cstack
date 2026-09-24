import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
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
            initialTonnes={modeledOffsetTonnes}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {currentPage === 'accounting' && <AccountingPage onNavigate={handleNavigate} />}

        {currentPage === 'reporting' && <ReportingPage onNavigate={handleNavigate} />}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccessLogin={() => setIsLoginOpen(false)}
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
