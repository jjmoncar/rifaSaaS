import React, { useState } from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { Check, Shield, CircleCheck, Star, Award, Search, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingPlansProps {
  currentLanguage: Language;
}

export default function PricingPlans({ currentLanguage }: PricingPlansProps) {
  const t = translations[currentLanguage];
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  return (
    <div className="space-y-12 py-4">
      
      {/* Title area */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-black text-gray-909 sm:text-4xl tracking-tight leading-none">
          {t.choosePlanTitle}{' '}
          <span className="text-emerald-700 font-black">{t.raffleGrowth}</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {t.pricingSubtitle}
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        
        {/* Starter Plan */}
        <div 
          onClick={() => setSelectedPlan('starter')}
          className={`bg-white rounded-2xl border p-6.5 flex flex-col justify-between transition-all cursor-pointer relative ${
            selectedPlan === 'starter'
              ? 'border-emerald-600 ring-2 ring-emerald-600/10 scale-101 shadow-xl'
              : 'border-gray-205 hover:border-emerald-600/50 shadow-xs'
          }`}
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{t.starterTitle}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.starterDesc}</p>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-gray-909">{t.starterPrice}</span>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 pt-3 border-t border-gray-100">
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.activeRaffleLimit}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.maxTicketLimit}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.basicSubdomain}</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-starter"
            className={`w-full mt-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
              selectedPlan === 'starter'
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                : 'bg-white border-gray-250 text-gray-600 hover:text-emerald-700 hover:border-emerald-600'
            }`}
          >
            {t.getStarted}
          </button>
        </div>

        {/* Pro Plan (Most popular) */}
        <div 
          onClick={() => setSelectedPlan('pro')}
          className={`bg-white rounded-2xl border p-6.5 flex flex-col justify-between transition-all cursor-pointer relative ${
            selectedPlan === 'pro'
              ? 'border-emerald-600 ring-4 ring-emerald-600/10 scale-102 shadow-2xl'
              : 'border-gray-205 hover:border-emerald-600/50 shadow-xs'
          }`}
        >
          {/* Most popular Ribbon */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-full shadow-md tracking-widest uppercase flex items-center gap-1">
            <Star size={11} fill="currentColor" />
            <span>{t.mostPopular}</span>
          </div>

          <div className="space-y-5 pt-2">
            <div>
              <h3 className="text-lg font-extrabold text-gray-901 flex items-center gap-2">
                <span>{t.proTitle}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">{t.proDesc}</p>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-gray-909">{t.proPrice}</span>
              <span className="text-xs text-gray-400 font-bold ml-1.5">{t.proPriceUnit}</span>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 pt-3 border-t border-gray-100">
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.proActiveLimit}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.proTicketLimit}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.verifiedAutoDraw}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.advancedDashboard}</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-pro"
            className="w-full mt-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl uppercase tracking-wider transition-all shadow-md shadow-emerald-700/10 cursor-pointer"
          >
            {t.goProNow}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div 
          onClick={() => setSelectedPlan('enterprise')}
          className={`bg-white rounded-2xl border p-6.5 flex flex-col justify-between transition-all cursor-pointer relative ${
            selectedPlan === 'enterprise'
              ? 'border-emerald-600 ring-2 ring-emerald-600/10 scale-101 shadow-xl'
              : 'border-gray-205 hover:border-emerald-600/50 shadow-xs'
          }`}
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{t.enterpriseTitle}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.enterpriseDesc}</p>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-gray-909">{t.enterprisePrice}</span>
              <span className="text-xs text-gray-400 font-bold ml-1.5">{t.enterprisePriceUnit}</span>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 pt-3 border-t border-gray-100">
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.unlimitedRaffles}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.customDomain}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.apiAccess}</span>
              </li>
              <li className="flex items-start gap-3.5 text-xs text-gray-600 font-medium leading-relaxed">
                <Check className="text-emerald-700 shrink-0 mt-0.5" size={15} strokeWidth={3} />
                <span>{t.prioritySupport}</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-enterprise"
            className={`w-full mt-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
              selectedPlan === 'enterprise'
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                : 'bg-white border-gray-250 text-gray-600 hover:text-emerald-700 hover:border-emerald-600'
            }`}
          >
            {t.contactSales}
          </button>
        </div>

      </div>

      {/* Trust & Security Bottom Section HUD */}
      <section className="bg-emerald-50 rounded-3xl p-8 max-w-5xl mx-auto border border-emerald-100/40 text-center md:text-left space-y-6">
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-2xl text-emerald-800 shadow-md shrink-0">
            <Shield size={36} className="animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-extrabold text-emerald-950 font-sans">{t.securityHeader}</h3>
            <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
              {t.securityDesc}
            </p>
          </div>
        </div>

        {/* Compliant Badges row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-200/55 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-900 bg-white/55 py-2.5 px-4 rounded-xl border border-emerald-200/20">
            <CircleCheck className="text-emerald-700" size={14} />
            <span>{t.soc2}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-900 bg-white/55 py-2.5 px-4 rounded-xl border border-emerald-200/20">
            <CircleCheck className="text-emerald-700" size={14} />
            <span>{t.gdpr}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-900 bg-white/55 py-2.5 px-4 rounded-xl border border-emerald-200/20">
            <CircleCheck className="text-emerald-700" size={14} />
            <span>{t.realTimeAudit}</span>
          </div>
        </div>

      </section>

    </div>
  );
}
