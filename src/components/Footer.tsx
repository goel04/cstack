import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { ActivePage } from '../types/carbon';
import { CStackLogo } from './CStackLogo';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Positioning */}
          <div className="md:col-span-1 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group focus:outline-hidden transition-opacity hover:opacity-90 inline-block"
              aria-label="CSTACK Home"
            >
              <CStackLogo size="md" theme="dark" />
            </button>
            <p className="text-sm text-slate-400 leading-relaxed">
              Precision climate intelligence for individuals and organizations. Measure emissions, model decarbonization pathways, and understand offset requirements.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GHG Protocol & ISO 14064 aligned</span>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Products
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 group text-left text-slate-300"
                >
                  <span>Carbon Calculator</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('accounting')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <span>Carbon Accounting</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <span>Carbon Marketplace</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <span className="text-emerald-400 font-semibold">•</span>
                  <span>Personal Carbon Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reporting')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <span>Carbon Reporting</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Methodology & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Methodology & Datasets
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span>Central Electricity Authority (CEA)</span>
                <span className="text-slate-300 font-mono">v19 / 2023</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span>UK DEFRA / DESNZ Standards</span>
                <span className="text-slate-300 font-mono">2024</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span>US EPA eGRID Emission Factors</span>
                <span className="text-slate-300 font-mono">2023</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>ICAO Aviation Carbon Model</span>
                <span className="text-slate-300 font-mono">v12</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About CSTACK
                </button>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Climate Research & Whitepapers</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Security & Data Privacy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">API Documentation (v1 beta)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Disclaimer Banner */}
        <div className="mt-8 pt-6 pb-2 text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <p className="font-semibold text-slate-300 mb-1">
            Methodological Notice & Offset Principle:
          </p>
          <p>
            Calculations provided by the CSTACK Carbon Calculator represent estimated greenhouse gas emissions expressed in tonnes of carbon dioxide equivalent (tCO₂e) using recognized regional and international emission factor datasets. Offset requirements are indicative of the volume required to achieve carbon neutrality and <strong className="text-slate-200 font-medium">do not constitute the issuance, generation, verification, or certification of carbon credits</strong>.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CSTACK Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Carbon Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
