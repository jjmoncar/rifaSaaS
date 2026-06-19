import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Raffle, TicketPurchase, UserProfile, AppNotification } from '../types';
import { Edit, Ticket, Award, Bell, Shield, ChevronRight, Activity, Zap } from 'lucide-react';

interface ClientDashboardProps {
  currentLanguage: Language;
  userProfile: UserProfile;
  purchases: TicketPurchase[];
  raffles: Raffle[];
  notifications: AppNotification[];
  onSelectRaffle: (raffle: Raffle) => void;
}

export default function ClientDashboard({
  currentLanguage,
  userProfile,
  purchases,
  raffles,
  notifications,
  onSelectRaffle
}: ClientDashboardProps) {
  const t = translations[currentLanguage];

  // States
  const [countdownStr, setCountdownStr] = useState('02:17:04:34');
  const [editedName, setEditedName] = useState(userProfile.name);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Dynamic ticking countdown sequence
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setDate(target.getDate() + 2);
      target.setHours(17, 4, 34, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownStr('00:00:00:00');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `0${days}:${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      setCountdownStr(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Profile Header HUD */}
      <section className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-600 p-0.5 bg-white shrink-0 shadow-xs">
            <img 
              referrerPolicy="no-referrer"
              src={userProfile.avatar} 
              alt={userProfile.name} 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            {isEditingProfile ? (
              <div className="flex items-center gap-2">
                <input
                  id="profile-edit-name-input"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-2 py-1 border border-gray-350 rounded-lg text-sm font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600"
                />
                <button
                  id="profile-save-name-btn"
                  onClick={() => {
                    userProfile.name = editedName;
                    setIsEditingProfile(false);
                  }}
                  className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <h1 className="text-xl font-extrabold text-gray-909 font-sans flex items-center gap-2">
                <span>{userProfile.name}</span>
              </h1>
            )}
            <p className="text-xs text-gray-500 mt-1 font-mono">{userProfile.email}</p>
            <div className="mt-2 text-left">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                {t.premiumMember}
              </span>
            </div>
          </div>
        </div>

        <button
          id="toggle-profile-edit-btn"
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="border border-gray-300 py-2.5 px-4.5 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Edit size={13} />
          <span>{t.editProfileText}</span>
        </button>
      </section>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Metric Card 1: Raffles Joined */}
        <div className="md:col-span-4 bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Activity size={18} />
            </span>
            <span className="text-emerald-700 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
              +2 this month
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.rafflesJoined}</p>
            <h2 className="text-3xl font-black text-gray-900 mt-0.5">{userProfile.rafflesJoinedCount}</h2>
          </div>
        </div>

        {/* Metric Card 2: Tickets Purchased */}
        <div className="md:col-span-4 bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between shadow-xs animate-pulse">
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Ticket size={18} />
            </span>
            <span className="text-emerald-700 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Top 5% User
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.ticketsPurchased}</p>
            <h2 className="text-3xl font-black text-gray-900 mt-0.5">{userProfile.ticketsPurchasedCount}</h2>
          </div>
        </div>

        {/* Slated black timer countdown with ticking progress bar */}
        <div className="md:col-span-4 relative overflow-hidden bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div>
              <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">{t.nextBigDrawIn}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono tracking-tight tabular-nums" id="profile-countdown-display">
                  {countdownStr}
                </span>
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-xs text-slate-300 font-semibold">{t.teslaFinale}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden block">
                <div className="bg-emerald-400 h-full w-[85%] rounded-full shadow-lg" />
              </div>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 text-slate-800 pointer-events-none opacity-20">
            <Zap size={132} fill="currentColor" />
          </div>
        </div>

      </div>

      {/* Columns: Active ticket list & statistics panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column Left (Double size): Tickets list and purchase statements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Tickets List */}
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-widest">{t.myActiveTickets}</h3>
            </div>
            <div className="divide-y divide-gray-150">
              
              {raffles.map((raffle) => {
                // Find all tickets bought by alex@example.com
                const userP = raffle.purchases.filter(p => p.buyerEmail === userProfile.email && p.status === 'Successful');
                const tNums = userP.map(p => p.ticketNumber);

                if (tNums.length === 0) return null;

                const isDrawn = raffle.status === 'drawn';
                const isWinner = isDrawn && tNums.includes(raffle.winnerTicket || '');

                return (
                  <div key={raffle.id} className="p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <button
                      id={`active-ticket-item-row-${raffle.id}`}
                      onClick={() => onSelectRaffle(raffle)}
                      className="flex items-center gap-3.5 text-left focus:outline-hidden cursor-pointer"
                    >
                      <div 
                        className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 bg-cover bg-center border border-gray-100"
                        style={{ backgroundImage: `url('${raffle.coverImage}')` }}
                      />
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                          {raffle.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                          <span className="text-[10px] text-gray-400 font-semibold tracking-wide">Código:</span>
                          {tNums.map((num, i) => (
                            <span key={i} className="font-mono text-xs font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md text-emerald-800">
                              #{num.padStart(3, '0')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 self-stretch md:self-auto">
                      {isDrawn ? (
                        isWinner ? (
                          <span className="bg-purple-100 text-purple-800 border border-purple-250 font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                            <Award size={12} className="text-purple-600" /> ¡Ganador!
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 font-semibold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                            No ganador
                          </span>
                        )
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Activo
                        </span>
                      )}
                      <button
                        id={`active-ticket-chevron-${raffle.id}`}
                        onClick={() => onSelectRaffle(raffle)}
                        className="p-1.5 border border-gray-200 text-gray-400 hover:text-emerald-700 hover:border-emerald-600 rounded-lg transition-all cursor-pointer bg-white"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Payment Statement list */}
          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex justify-between items-center bg-gray-25/50">
              <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-widest">{t.paymentHistory}</h3>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-5 py-3">{t.date}</th>
                    <th className="px-5 py-3">{t.raffle}</th>
                    <th className="px-5 py-3">{t.amount}</th>
                    <th className="px-5 py-3 text-center">{t.pHistoryStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((p, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                        {p.timestamp}
                      </td>
                      <td className="px-5 py-4.5 text-xs font-bold text-gray-800 uppercase tracking-tight">
                        {p.raffle}
                      </td>
                      <td className="px-5 py-4.5 text-xs font-mono font-bold text-gray-800 whitespace-nowrap">
                        {p.currency === 'USD' ? '$' : p.currency === 'BRL' ? 'R$' : 'π'}
                        {p.amount.toLocaleString('en-US', { minimumFractionDigits: p.currency === 'Pi' ? 0 : 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4.5">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            p.status === 'Successful'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : p.status === 'Processing'
                              ? 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse'
                              : 'bg-red-50 text-red-800 border-red-100'
                          }`}>
                            {p.status === 'Successful' && t.successful}
                            {p.status === 'Processing' && t.processing}
                            {p.status === 'Failed' && 'Failed'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Column Right (Single Size): widgets & alerts */}
        <div className="space-y-6">
          
          {/* Win Probability chart meters */}
          <div className="bg-emerald-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <h3 className="text-xs font-extrabold text-emerald-200 uppercase tracking-widest">{t.winProbability}</h3>
            
            <div className="relative pt-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-full bg-emerald-700 text-white shadow-inner">
                    {t.currentRank}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">65%</span>
                </div>
              </div>

              {/* Progress meter */}
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-emerald-900/60 block border border-emerald-600/30">
                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-400 to-emerald-350" style={{ width: '65%' }} />
              </div>
            </div>

            <p className="text-xs italic text-emerald-100 leading-relaxed font-medium">
              "{t.joinMoreRewards}"
            </p>
          </div>

          {/* Quick Notifications feed alerts */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2.5">
              {t.quickNotifications}
            </h3>
            
            <div className="space-y-4">
              {notifications.slice(0, 4).map((notif, index) => (
                <div 
                  key={notif.id} 
                  className={`flex gap-3.5 items-start pl-3.5 border-l-3 transition-opacity ${
                    notif.type === 'success' 
                      ? 'border-emerald-600' 
                      : notif.type === 'draw'
                      ? 'border-purple-600 bg-purple-50/30 p-2 rounded-r-xl'
                      : 'border-amber-600'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-gray-901 leading-snug">{notif.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-normal">{notif.message}</p>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-2 block font-semibold">{notif.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
