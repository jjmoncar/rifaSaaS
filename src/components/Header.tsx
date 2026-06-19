import React from 'react';
import { translations } from '../translations';
import { Language, UserProfile } from '../types';
import { Globe, Bell, User, LayoutDashboard, Ticket, DollarSign, Award } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: 'organizer' | 'client';
  onRoleToggle: (role: 'organizer' | 'client') => void;
  userProfile: UserProfile;
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadNotificationsCount: number;
  onAlertsClick: () => void;
  isLoggedIn?: boolean;
  onAuthBtnClick?: () => void;
}

export default function Header({
  currentLanguage,
  onLanguageChange,
  userRole,
  onRoleToggle,
  userProfile,
  currentTab,
  onTabChange,
  unreadNotificationsCount,
  onAlertsClick,
  isLoggedIn,
  onAuthBtnClick
}: HeaderProps) {
  const t = translations[currentLanguage];

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 bg-white border-b border-gray-200 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Plan Badge */}
        <div className="flex items-center gap-3">
          <button 
            id="brand-logo"
            onClick={() => onTabChange(userRole === 'organizer' ? 'dashboard' : 'home')}
            className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
          >
            <span className="text-xl font-bold tracking-tight text-emerald-700 font-sans">
              {t.brand}
            </span>
          </button>
          
          <span className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide">
            {t.proPlan}
          </span>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-5">
          <nav className="flex gap-1">
            {userRole === 'organizer' ? (
              <>
                <button
                  id="tab-btn-dashboard"
                  onClick={() => onTabChange('dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {t.tabDashboard}
                </button>
                <button
                  id="tab-btn-pricing"
                  onClick={() => onTabChange('pricing')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'pricing'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {t.tabPricing}
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-btn-home"
                  onClick={() => onTabChange('home')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'home'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {t.tabHome}
                </button>
                <button
                  id="tab-btn-mytickets"
                  onClick={() => onTabChange('mytickets')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'mytickets'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {t.tabMyTickets}
                </button>
                <button
                  id="tab-btn-pricing"
                  onClick={() => onTabChange('pricing')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'pricing'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {t.tabPricing}
                </button>
                <button
                  id="tab-btn-profile"
                  onClick={() => onTabChange('profile')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'profile'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {t.tabProfile}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Quick controls (Access Mode Switch, Language, Alert indicators, Profile badge) */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          
          {/* User Role Quick-Switch Pill */}
          <div className="bg-gray-100 p-0.5 sm:p-1 rounded-full flex items-center shadow-inner">
            <button
              id="switch-role-organizer"
              onClick={() => {
                onRoleToggle('organizer');
                onTabChange('dashboard');
              }}
              title="Switch to Organizer view"
              className={`px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all cursor-pointer ${
                userRole === 'organizer'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              SaaS Admin
            </button>
            <button
              id="switch-role-client"
              onClick={() => {
                onRoleToggle('client');
                onTabChange('home');
              }}
              title="Switch to Client/Buyer view"
              className={`px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all cursor-pointer ${
                userRole === 'client'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              Comprar
            </button>
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative group/lang flex items-center">
            <button 
              id="language-globe"
              className="p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 focus:outline-hidden"
              title="Select Language / Seleccionar Idioma"
            >
              <Globe size={18} />
              <span className="text-xs font-semibold text-gray-700 uppercase">{currentLanguage}</span>
            </button>
            
            {/* Popover Language Selector */}
            <div className="absolute right-0 top-10 w-32 bg-white rounded-lg border border-gray-100 shadow-xl opacity-0 group-hover/lang:opacity-100 group-hover/lang:translate-y-0 translate-y-1 pointer-events-none group-hover/lang:pointer-events-auto transition-all duration-200 z-50 overflow-hidden">
              <button
                id="lang-option-es"
                onClick={() => onLanguageChange('es')}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-medium border-b border-gray-50 flex items-center justify-between cursor-pointer ${
                  currentLanguage === 'es' ? 'text-white bg-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Español</span>
                <span className="text-[10px] opacity-75">ES</span>
              </button>
              <button
                id="lang-option-en"
                onClick={() => onLanguageChange('en')}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-medium border-b border-gray-50 flex items-center justify-between cursor-pointer ${
                  currentLanguage === 'en' ? 'text-white bg-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>English</span>
                <span className="text-[10px] opacity-75">EN</span>
              </button>
              <button
                id="lang-option-pt"
                onClick={() => onLanguageChange('pt')}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between cursor-pointer ${
                  currentLanguage === 'pt' ? 'text-white bg-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Português</span>
                <span className="text-[10px] opacity-75">PT</span>
              </button>
            </div>
          </div>

          {/* Alarm Indicator Icon Button */}
          <button
            id="notification-bell"
            onClick={onAlertsClick}
            className="p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-emerald-700 transition-colors relative cursor-pointer focus:outline-hidden"
            title="Alerts Feed"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 border border-white text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Small Profile Icon Badge / Sign In option */}
          {isLoggedIn ? (
            <button
              id="profile-nav-avatar"
              onClick={() => {
                onRoleToggle('client');
                onTabChange('profile');
              }}
              className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-emerald-50 text-emerald-800 transition-transform active:scale-95 cursor-pointer hover:border-emerald-600 focus:outline-hidden shrink-0"
              title={userProfile.name}
            >
              <img 
                referrerPolicy="no-referrer" 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <button
              id="header-sign-in-cta"
              onClick={onAuthBtnClick}
              className="bg-emerald-700 text-white text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-lg hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
            >
              <User size={13} />
              <span>
                {currentLanguage === 'es' ? 'Acceder' : currentLanguage === 'pt' ? 'Entrar' : 'Sign In'}
              </span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
