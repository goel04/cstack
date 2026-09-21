import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, ArrowRight, Sparkles, Shield, BarChart3, ShoppingBag, FileSpreadsheet } from 'lucide-react';
import { ActivePage } from '../types/carbon';
import { CStackLogo } from './CStackLogo';

interface HeaderProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onOpenLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSelect = (page: ActivePage) => {
    onNavigate(page);
    setIsProductsOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navigation-header"
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
          : 'bg-white/60 backdrop-blur-xs border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center text-left group focus:outline-hidden transition-opacity hover:opacity-85"
            aria-label="CSTACK Home"
          >
            <CStackLogo size="md" theme="light" />
          </button>
        </div>

        {/* Center Navigation: Desktop */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            id="nav-link-home"
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-md transition-colors hover:text-slate-900 hover:bg-slate-100/70 ${
              currentPage === 'home' ? 'text-slate-900 font-semibold bg-slate-100' : ''
            }`}
          >
            Home
          </button>

          {/* Products Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-dropdown-products-btn"
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className={`px-3.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5 hover:text-slate-900 hover:bg-slate-100/70 ${
                isProductsOpen || currentPage === 'calculator' || currentPage === 'marketplace'
                  ? 'text-slate-900 font-semibold'
                  : ''
              }`}
              aria-expanded={isProductsOpen}
            >
              <span>Products</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isProductsOpen ? 'rotate-180 text-emerald-700' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProductsOpen && (
              <div
                id="products-dropdown-menu"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200/90 shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Products</span>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Climate Suite
                  </span>
                </div>

                {/* 1. Carbon Calculator (Active) */}
                <button
                  id="product-item-calculator"
                  onClick={() => handleProductSelect('calculator')}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 group border border-transparent hover:border-slate-200/60"
                >
                  <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                    <span className="text-base">🌱</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Carbon Calculator
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Live
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Calculate and understand your carbon footprint.
                    </p>
                  </div>
                </button>

                {/* 2. Carbon Accounting */}
                <button
                  id="product-item-accounting"
                  onClick={() => handleProductSelect('accounting')}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 group border border-transparent hover:border-slate-200/60"
                >
                  <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                    <span className="text-base">📊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">
                        Carbon Accounting
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Track your organization's Scope 1, 2, and 3 emissions.
                    </p>
                  </div>
                </button>

                {/* 3. Carbon Marketplace */}
                <button
                  id="product-item-marketplace"
                  onClick={() => handleProductSelect('marketplace')}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 group border border-transparent hover:border-slate-200/60"
                >
                  <div className="w-8 h-8 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100 group-hover:bg-sky-100 transition-colors">
                    <span className="text-base">🌐</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-sky-800 transition-colors">
                        Carbon Marketplace
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Explore and manage verified carbon credit offsets.
                    </p>
                  </div>
                </button>

                {/* 4. Carbon Reporting */}
                <button
                  id="product-item-reporting"
                  onClick={() => handleProductSelect('reporting')}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 group border border-transparent hover:border-slate-200/60"
                >
                  <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100 group-hover:bg-teal-100 transition-colors">
                    <span className="text-base">📋</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                        Carbon Reporting
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Generate auditable carbon disclosures and filings.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            id="nav-link-about"
            onClick={() => onNavigate('about')}
            className={`px-3.5 py-1.5 rounded-md transition-colors hover:text-slate-900 hover:bg-slate-100/70 ${
              currentPage === 'about' ? 'text-slate-900 font-semibold bg-slate-100' : ''
            }`}
          >
            About
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            id="nav-login-btn"
            onClick={onOpenLogin}
            className="text-sm font-medium text-slate-600 hover:text-slate-950 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Log in
          </button>
          <button
            id="nav-get-started-btn"
            onClick={() => onNavigate('calculator')}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in fade-in duration-150"
        >
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-900 hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-900 hover:bg-slate-50"
            >
              About
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Products
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleProductSelect('calculator')}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between bg-emerald-50/70 border border-emerald-100 text-emerald-900 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span>🌱</span> Carbon Calculator
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  Available
                </span>
              </button>

              <button
                onClick={() => handleProductSelect('accounting')}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
              >
                <span className="flex items-center gap-2">
                  <span>📊</span> Carbon Accounting
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  Enterprise
                </span>
              </button>

              <button
                onClick={() => handleProductSelect('marketplace')}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
              >
                <span className="flex items-center gap-2">
                  <span>🌐</span> Carbon Marketplace
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  Verified
                </span>
              </button>

              <button
                onClick={() => handleProductSelect('reporting')}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-slate-700 hover:bg-slate-50 font-medium"
              >
                <span className="flex items-center gap-2">
                  <span>📋</span> Carbon Reporting
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  Auditable
                </span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-2.5 px-4 rounded-lg text-center font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Log in
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('calculator');
              }}
              className="w-full py-2.5 px-4 rounded-lg text-center font-semibold text-white bg-slate-900 hover:bg-slate-800"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
