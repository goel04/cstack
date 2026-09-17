import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { HomePage } from './pages/HomePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { AboutPage } from './pages/AboutPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AccountingPage } from './pages/AccountingPage';
import { ReportingPage } from './pages/ReportingPage';
import { ActivePage } from './types/carbon';

export default function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [modeledOffsetTonnes, setModeledOffsetTonnes] = useState<number>(24.6);

  const handleNavigate = (page: ActivePage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Notification if logged in */}
      {userEmail && (
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Logged in as <strong>{userEmail}</strong> (CSTACK Enterprise Workspace)</span>
          <button
            onClick={() => setUserEmail(null)}
            className="text-slate-400 hover:text-white underline ml-2 text-[11px]"
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccessLogin={handleLoginSuccess}
      />
    </div>
  );
}
