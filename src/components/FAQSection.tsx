import React, { useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  Search,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FAQItem {
  id: string;
  category: 'offsetting' | 'platform' | 'compliance';
  question: string;
  answer: string;
  highlights?: string[];
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'offsetting',
    question: 'What is a carbon offset credit, and how is it quantified?',
    answer:
      'A carbon credit represents exactly one metric tonne of greenhouse gas emissions (1 tCO₂e) that has either been avoided from entering the atmosphere or permanently removed from it through certified climate intervention projects. Credits are issued by accredited international registries such as Puro.earth, Isometric, Verra VCS, and Gold Standard after rigorous third-party verification.',
    highlights: [
      '1 Credit = 1 Metric Tonne of CO₂ equivalent (1 tCO₂e)',
      'Verified by independent accredited registries',
      'Permanently serialized to prevent double-counting',
    ],
  },
  {
    id: 'faq-2',
    category: 'offsetting',
    question: 'What is the crucial difference between Carbon Avoidance and Carbon Removal (CDR)?',
    answer:
      'Carbon Avoidance projects prevent planned emissions from occurring—such as preserving standing tropical forests, generating renewable wind power, or capturing methane from landfills. Carbon Removal (Carbon Dioxide Removal or CDR), on the other hand, actively and physically extracts ambient CO₂ already present in the atmosphere and locks it away for centuries or millennia using technologies like Biochar (100+ years), Enhanced Rock Weathering (1,000+ years), or Direct Air Capture with Basalt Mineralization (1,000+ years). CSTACK strongly prioritizes high-durability CDR for credible net-zero claims.',
    highlights: [
      'Avoidance: Stops prospective emissions from occurring',
      'Removal (CDR): Physically draws down atmospheric carbon',
      'Durability: Ranging from decadal biological storage to millennial geological permanence',
    ],
  },
  {
    id: 'faq-3',
    category: 'offsetting',
    question: 'What is the Mitigation Hierarchy, and why must companies reduce emissions before offsetting?',
    answer:
      'The mitigation hierarchy is the foundational scientific guideline established by the Science Based Targets initiative (SBTi) and the Oxford Offsetting Principles. It dictates that organizations must first Avoid unnecessary energy and material demand, then Reduce operational emissions through energy efficiency, clean power PPAs, and supply chain decarbonization. Offsetting is strictly reserved to neutralize residual, hard-to-abate emissions as the final step.',
    highlights: [
      'Step 1: Avoid unnecessary carbon-intensive activities',
      'Step 2: Reduce direct and indirect operational footprint',
      'Step 3: Neutralize only true residual emissions',
    ],
  },
  {
    id: 'faq-4',
    category: 'platform',
    question: 'How does the CSTACK calculation engine estimate emissions?',
    answer:
      'CSTACK separates the calculation engine entirely from the presentation layer. Our algorithms utilize peer-reviewed national and international emission factor datasets: India Central Electricity Authority (CEA v19) for grid electricity (0.716 kgCO₂e/kWh), UK DEFRA/DESNZ (2024) for transit fuel types and short/long-haul flights (with Radiative Forcing multipliers for high-altitude non-CO₂ effects), and IPCC AR6 global warming potentials.',
    highlights: [
      'Decoupled calculation engine with modular emission factors',
      'Aviation calculations include high-altitude Radiative Forcing (RF)',
      'Electricity calculations reflect local grid carbon intensity',
    ],
  },
  {
    id: 'faq-5',
    category: 'platform',
    question: 'Does estimating our footprint on CSTACK generate or certify carbon credits?',
    answer:
      'No. CSTACK operates with strict scientific integrity: estimating your carbon footprint is an analytical measurement tool that models your operational emissions and calculates your estimated offset requirement. The calculation itself does NOT generate, certify, issue, or grant carbon credits. Authentic carbon credits must originate from verified project registries and undergo rigorous physical auditing.',
    highlights: [
      'Footprint modeling is an analytical diagnostic',
      'Zero self-certification or artificial credit generation',
      'Compensation credits are sourced from audited public registries',
    ],
  },
  {
    id: 'faq-6',
    category: 'platform',
    question: 'How does CSTACK prevent greenwashing?',
    answer:
      'We eliminate greenwashing through transparent data provenance, full mathematical auditability, and clear distinction between Scopes. We provide exact emission factor citations for every calculated figure, offer verifiable retirement serial numbers for credit purchases, and reject speculative claims or unverified offset schemes.',
    highlights: [
      'Open emission factor citations (DEFRA, CEA, IPCC)',
      'Public registry serialization on retirement',
      'Scope 1, 2, and 3 boundary transparency',
    ],
  },
  {
    id: 'faq-7',
    category: 'compliance',
    question: 'How does CSTACK support corporate ESG compliance (CSRD, BRSR, SEC, TCFD)?',
    answer:
      'CSTACK Carbon Accounting and Carbon Reporting modules automatically categorize emissions according to the GHG Protocol Corporate Standard. The reporting engine maps corporate activity data directly to ESRS E1 Climate Change requirements under the EU Corporate Sustainability Due Diligence Directive (CSRD), the SEBI Business Responsibility and Sustainability Reporting (BRSR Core) framework in India, SEC Climate Disclosures in the US, and TCFD pillars. You can export audit-ready PDF disclosures and structured iXBRL data packages.',
    highlights: [
      'Pre-formatted filings for CSRD, BRSR Core, SEC, and TCFD',
      'Dual Scope 2 accounting (Location-based vs. Market-based)',
      'Exportable iXBRL, CSV ledger, and PDF audit documentation',
    ],
  },
  {
    id: 'faq-8',
    category: 'compliance',
    question: 'Can enterprises integrate custom internal utility data and ERP systems into CSTACK?',
    answer:
      'Yes. Through CSTACK Carbon Accounting, organizations can add custom activity records for stationary boilers, corporate vehicle fleets, utility meter data, and supplier spend inflows. Activity entries track facility locations, activity metrics, applied emission factors, and verification audit statuses.',
    highlights: [
      'Facility-level segmentation (HQ, data centers, plants)',
      'Custom activity entries across Scopes 1, 2, and 3',
      'Target tracking aligned with SBTi 1.5°C pathways',
    ],
  },
];

export const FAQSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'offsetting' | 'platform' | 'compliance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="faq-section" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
      {/* Heading & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight">
            Understanding Carbon Offsetting & CSTACK
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Clear, honest answers regarding emission calculations, verified carbon credits, high-permanence removal, and regulatory compliance.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="faq-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'offsetting', label: 'Carbon Offsetting & Removal' },
          { id: 'platform', label: 'CSTACK Platform & Science' },
          { id: 'compliance', label: 'Standards & ESG Compliance' },
        ].map((cat) => (
          <button
            key={cat.id}
            id={`faq-category-btn-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No matching questions found</p>
            <p className="text-xs text-slate-500">
              Try searching with different terms or select "All Questions".
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOpen = expandedId === item.id;
            return (
              <div
                key={item.id}
                id={`faq-accordion-item-${item.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-slate-300 bg-slate-50/50 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5 shrink-0 ${
                        item.category === 'offsetting'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.category === 'platform'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.category === 'offsetting'
                        ? 'Offsetting'
                        : item.category === 'platform'
                        ? 'Platform'
                        : 'Compliance'}
                    </span>
                    <span className="text-sm sm:text-base font-display font-bold text-slate-900 leading-snug">
                      {item.question}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-slate-200 text-slate-900' : ''
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3.5 border-t border-slate-200/60">
                        <p>{item.answer}</p>

                        {item.highlights && item.highlights.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                              Key Takeaways
                            </span>
                            <ul className="space-y-1">
                              {item.highlights.map((h, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
