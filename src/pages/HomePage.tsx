import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, ChevronRight, Activity, Zap, Car, Plane, Layers, BarChart3 } from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface HomePageProps {
  onNavigate: (page: ActivePage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div id="home-page" className="w-full space-y-24 sm:space-y-32 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>CSTACK Climate Intelligence V1.0</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-slate-950 leading-[1.1]">
                Measure Your Carbon.{' '}
                <span className="text-slate-900">Understand Your Impact.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
                Calculate your carbon footprint in minutes and understand how much CO₂e your activities generate.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  id="hero-cta-calculate"
                  onClick={() => onNavigate('calculator')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md hover:shadow-lg"
                >
                  <span>Calculate Your Footprint</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  id="hero-cta-explore"
                  onClick={() => onNavigate('calculator')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.99] transition-all shadow-xs"
                >
                  <span>Explore Carbon Calculator</span>
                </button>
              </div>

              {/* Mini trust points */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Configurable regional emission factors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No login required for estimation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Scope 1, 2 & 3 methodology</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Visual (Dashboard-style visualization requested in prompt) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md w-full">
                {/* Decorative border backdrop glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-200 to-teal-100 opacity-50 blur-lg" />

                {/* Dashboard Card */}
                <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                        Live Preview Model
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Annualized
                    </span>
                  </div>

                  {/* Big Footprint Metric */}
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block">
                      Your Carbon Footprint
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight">
                        12.8
                      </span>
                      <span className="text-xl font-display font-semibold text-slate-600">
                        tCO₂e
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Based on standard activity and grid emissions
                    </p>
                  </div>

                  {/* Breakdown Progress Bars */}
                  <div className="space-y-3.5 pt-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Emissions Breakdown
                    </div>

                    {/* Electricity - 42% */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          Electricity
                        </span>
                        <span className="font-mono-data font-semibold text-slate-900">
                          42%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[42%] transition-all duration-1000" />
                      </div>
                    </div>

                    {/* Transportation - 28% */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Car className="w-3.5 h-3.5 text-teal-600" />
                          Transportation
                        </span>
                        <span className="font-mono-data font-semibold text-slate-900">
                          28%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full w-[28%] transition-all duration-1000" />
                      </div>
                    </div>

                    {/* Travel - 18% */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Plane className="w-3.5 h-3.5 text-sky-600" />
                          Travel
                        </span>
                        <span className="font-mono-data font-semibold text-slate-900">
                          18%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 rounded-full w-[18%] transition-all duration-1000" />
                      </div>
                    </div>

                    {/* Other - 12% */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          Other
                        </span>
                        <span className="font-mono-data font-semibold text-slate-900">
                          12%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500 rounded-full w-[12%] transition-all duration-1000" />
                      </div>
                    </div>
                  </div>

                  {/* Card bottom footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Estimated Offset: <strong>12.8 tonnes</strong></span>
                    <button
                      onClick={() => onNavigate('calculator')}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Simulate Custom</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            The Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 tracking-tight">
            From Activity to Carbon Impact
          </h2>
          <p className="text-slate-600 text-base">
            A simple, transparent methodology grounded in verified carbon accounting standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative">
            <div className="font-mono-data text-emerald-700 font-bold text-sm tracking-wider mb-4">
              01
            </div>
            <h3 className="text-xl font-display font-bold text-slate-950 mb-2.5">
              Enter Your Data
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Tell us about your electricity, transportation, travel and other activities.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
              Input kWh, kilometers, and flight frequency without complex technical jargon.
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative">
            <div className="font-mono-data text-emerald-700 font-bold text-sm tracking-wider mb-4">
              02
            </div>
            <h3 className="text-xl font-display font-bold text-slate-950 mb-2.5">
              Calculate
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our calculation engine converts your activity data into estimated CO₂e emissions.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
              Applies verified regional grid factors, passenger vehicle averages, and aviation formulas.
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all relative">
            <div className="font-mono-data text-emerald-700 font-bold text-sm tracking-wider mb-4">
              03
            </div>
            <h3 className="text-xl font-display font-bold text-slate-950 mb-2.5">
              Understand
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              See your total footprint, emission sources and estimated offset requirement.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
              Interactive breakdowns uncover your highest-impact reduction opportunities.
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 tracking-tight">
              One Platform. Multiple Carbon Products.
            </h2>
          </div>
          <p className="text-slate-500 text-sm max-w-sm">
            Modular climate software built for every stage of your decarbonization journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Carbon Calculator (Available Now) */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-6 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                  🌱
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Available Now
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-slate-950">
                Carbon Calculator
              </h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Calculate your carbon footprint with precision activity-based emission modeling.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                id="product-card-calculator-btn"
                onClick={() => onNavigate('calculator')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Try Calculator</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Card 2: Carbon Accounting */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-100">
                  📊
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  GHG Protocol
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-slate-950">
                Carbon Accounting
              </h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Track your organization's emissions across Scope 1, Scope 2, and upstream Scope 3.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('accounting')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch Accounting</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Card 3: Carbon Marketplace */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg border border-sky-100">
                  🌐
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Puro & Verra
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-slate-950">
                Carbon Marketplace
              </h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Explore and manage carbon credits with high-permanence durability ratings.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('marketplace')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Card 4: Carbon Reporting */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100">
                  📋
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  CSRD & BRSR
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-slate-950">
                Carbon Reporting
              </h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Generate carbon reports for your organization aligned with CSRD, BRSR, and SEC standards.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('reporting')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Generate Disclosures</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DASHBOARD PREVIEW (Specified in prompt) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Subtle background graphic */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Product Intelligence Preview
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                  Enterprise Assessment Dashboard
                </h3>
              </div>
              <button
                onClick={() => onNavigate('calculator')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Carbon Footprint */}
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Total Carbon Footprint
                </span>
                <div className="mt-2">
                  <span className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
                    24.6
                  </span>
                  <span className="ml-2 text-xl font-display text-slate-400">
                    tCO₂e
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Normalized annual emission baseline
                </p>
              </div>

              {/* Estimated offset requirement */}
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-emerald-900/60 relative">
                <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
                  Estimated Offset Requirement
                </span>
                <div className="mt-2">
                  <span className="text-4xl sm:text-5xl font-display font-bold text-emerald-300 tracking-tight">
                    24.6
                  </span>
                  <span className="ml-2 text-xl font-display text-emerald-400/80">
                    tonnes CO₂e
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  1:1 compensation volume requirement
                </p>
              </div>

              {/* Status */}
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 sm:col-span-2 lg:col-span-1">
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Audit Readiness
                </span>
                <div className="mt-2 flex items-center gap-2 text-white font-display font-bold text-2xl">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Verified Factors</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  GHG Protocol Corporate Accounting Standard v2.1
                </p>
              </div>
            </div>

            {/* Breakdown Cards Grid (Prompt requirement: Electricity 8.4 tCO2e, Transportation 6.2 tCO2e, Business Travel 5.7 tCO2e, Other 4.3 tCO2e) */}
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Detailed Emission Sources
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Electricity */}
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Electricity
                    </span>
                    <span className="text-emerald-400 font-mono">34%</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    8.4 <span className="text-sm font-normal text-slate-400">tCO₂e</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Scope 2 Market Grid</p>
                </div>

                {/* Transportation */}
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Car className="w-4 h-4 text-teal-400" />
                      Transportation
                    </span>
                    <span className="text-teal-400 font-mono">25%</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    6.2 <span className="text-sm font-normal text-slate-400">tCO₂e</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Vehicle fleet & commuting</p>
                </div>

                {/* Business Travel */}
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Plane className="w-4 h-4 text-sky-400" />
                      Business Travel
                    </span>
                    <span className="text-sky-400 font-mono">23%</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    5.7 <span className="text-sm font-normal text-slate-400">tCO₂e</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Aviation & lodging</p>
                </div>

                {/* Other */}
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Layers className="w-4 h-4 text-slate-400" />
                      Other
                    </span>
                    <span className="text-slate-400 font-mono">18%</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    4.3 <span className="text-sm font-normal text-slate-400">tCO₂e</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Natural gas & waste</p>
                </div>
              </div>
            </div>

            {/* Small disclaimer (Prompt required verbatim) */}
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <span className="text-emerald-400 text-sm font-bold">ℹ</span>
              <p>
                "Offset requirements are an estimate based on the emissions calculated and do not represent issuance of carbon credits."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-100 to-emerald-50/50 rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-display font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
            C
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
              Ready to calculate your carbon impact?
            </h2>
            <p className="text-slate-600 text-base">
              Takes less than 3 minutes. No complex setup or software installation required.
            </p>
          </div>
          <div>
            <button
              onClick={() => onNavigate('calculator')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all"
            >
              <span>Launch Carbon Calculator</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
