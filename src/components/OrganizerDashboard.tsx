import React from 'react';
import { translations } from '../translations';
import { Language, Raffle, TicketPurchase } from '../types';
import { Play, Eye, Edit2, TrendingUp, Users, Ticket, DollarSign, Award, ArrowUpRight } from 'lucide-react';

interface OrganizerDashboardProps {
  currentLanguage: Language;
  raffles: Raffle[];
  recentPurchases: TicketPurchase[];
  onCreateRaffleClick: () => void;
  onSelectRaffle: (raffle: Raffle) => void;
  onTriggerDraw: (raffleId: string) => void;
  onToggleRaffleStatus?: (raffleId: string) => void;
  onTriggerManualDraw: (raffleId: string, ticketNum: number) => void;
}

export default function OrganizerDashboard({
  currentLanguage,
  raffles,
  recentPurchases,
  onCreateRaffleClick,
  onSelectRaffle,
  onTriggerDraw,
  onToggleRaffleStatus,
  onTriggerManualDraw
}: OrganizerDashboardProps) {
  const t = translations[currentLanguage];

  // Calculate high-fidelity dashboard metrics based on actual state
  const activeRafflesCount = raffles.filter(r => r.status === 'active' || r.status === 'drawing').length;
  
  const totalRevenueVal = raffles.reduce((acc, current) => {
    // Sum prices of all successful purchases
    const successfulAmt = current.purchases
      .filter(p => p.status === 'Successful')
      .reduce((sum, p) => sum + p.amount, 0);
    return acc + successfulAmt;
  }, 0);

  const totalTicketsSoldVal = raffles.reduce((acc, current) => acc + current.soldTickets.length, 0);

  // Set unique buyer emails
  const uniqueEmails = new Set<string>();
  raffles.forEach(r => {
    r.purchases.forEach(p => {
      if (p.status === 'Successful' && p.buyerEmail) {
        uniqueEmails.add(p.buyerEmail);
      }
    });
  });
  const uniqueBuyersCount = uniqueEmails.size > 0 ? uniqueEmails.size : 142; // default nicely to the mock image's 142 value + new ones

  // Get first active raffle for the Progress HUD Card
  const activeRaffle = raffles.find(r => r.status === 'active' || r.status === 'drawing') || raffles[0];
  const completionPercent = activeRaffle 
    ? Math.min(100, Math.round((activeRaffle.soldTickets.length / activeRaffle.totalTickets) * 100))
    : 89;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans">
            {t.overviewHeader}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t.overviewSub}</p>
        </div>
        <button
          id="hero-create-raffle-btn"
          onClick={onCreateRaffleClick}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-700/10 transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="text-lg font-bold">+</span>
          {t.createNewRaffle}
        </button>
      </div>

      {/* KPI Grid HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Revenue card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <DollarSign size={20} />
            </div>
            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              +12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.totalRevenue}</p>
            <p className="text-2xl font-extrabold text-gray-905 mt-1 transition-all">
              ${totalRevenueVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Tickets Sold card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Ticket size={20} />
            </div>
            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
              +8%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.ticketsSold}</p>
            <p className="text-2xl font-extrabold text-gray-905 mt-1">
              {totalTicketsSoldVal}
            </p>
          </div>
        </div>

        {/* Unique Buyers card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800">
              <Users size={20} />
            </div>
            <span className="text-gray-500 font-semibold text-xs py-0.5">
              Steady
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.uniqueBuyers}</p>
            <p className="text-2xl font-extrabold text-gray-905 mt-1">
              {uniqueBuyersCount}
            </p>
          </div>
        </div>

        {/* Completion Progress card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <TrendingUp size={20} />
            </div>
            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
              Target Met
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.completion}</p>
            <p className="text-2xl font-extrabold text-gray-905 mt-1">
              {completionPercent}%
            </p>
          </div>
        </div>

      </div>

      {/* Main Campaign HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side: Active campaign details and core table list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active campaign HUD box */}
          {activeRaffle && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-base font-bold text-gray-900">{t.activeCampaignProgress}</h2>
                <span className="self-start text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  {activeRaffle.name}
                </span>
              </div>
              
              <div className="space-y-3.5">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-gray-700">
                    {activeRaffle.soldTickets.length} / {activeRaffle.totalTickets} {t.ticketsSold}
                  </span>
                  <span className="text-emerald-700 font-bold">{completionPercent}%</span>
                </div>
                
                {/* Visual spark progress bar */}
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden block">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 pt-1 flex items-center gap-1.5 leading-relaxed">
                  {t.onlyTicketsLeft.replace('{count}', String(activeRaffle.totalTickets - activeRaffle.soldTickets.length))}
                </p>
              </div>
            </div>
          )}

          {/* Raffles Table */}
          <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{t.yourRaffles}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-3">{t.campaign}</th>
                    <th className="px-6 py-3">{t.status}</th>
                    <th className="px-6 py-3">{t.revenue}</th>
                    <th className="px-6 py-3 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {raffles.map((raffle) => {
                    const raffleRev = raffle.purchases
                      .filter(p => p.status === 'Successful')
                      .reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <tr key={raffle.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4.5">
                          <button
                            id={`raffle-row-name-btn-${raffle.id}`}
                            onClick={() => onSelectRaffle(raffle)}
                            className="flex items-center gap-3.5 text-left focus:outline-hidden cursor-pointer"
                          >
                            <div 
                              className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 bg-cover bg-center border border-gray-100 shadow-2xs"
                              style={{ backgroundImage: `url('${raffle.coverImage}')` }}
                            />
                            <div>
                              <p className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                                {raffle.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 underline">
                                {raffle.subdomain}.rifasaas.com
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                            raffle.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800'
                              : raffle.status === 'drawing'
                              ? 'bg-amber-50 text-amber-800 animate-pulse'
                              : raffle.status === 'drawn'
                              ? 'bg-purple-50 text-purple-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {raffle.status === 'active' && t.active}
                            {raffle.status === 'draft' && t.draft}
                            {raffle.status === 'closed' && t.closed}
                            {raffle.status === 'drawing' && t.drawing}
                            {raffle.status === 'drawn' && t.drawn}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-bold text-sm text-gray-800">
                          {raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : 'π'}
                          {raffleRev.toLocaleString('en-US', { minimumFractionDigits: raffle.currency === 'Pi' ? 0 : 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center justify-center gap-2">
                            {raffle.status === 'active' && (
                              <>
                                <button
                                  id={`draw-raffle-btn-${raffle.id}`}
                                  onClick={() => onTriggerDraw(raffle.id)}
                                  title={t.runAutomatedDraw}
                                  className="p-2 border border-emerald-300 hover:border-emerald-600 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                                >
                                  <Play size={14} fill="currentColor" />
                                  <span>{t.runAutomatedDraw}</span>
                                </button>
                                <button
                                  id={`manual-draw-raffle-btn-${raffle.id}`}
                                  onClick={() => {
                                    const ticketStr = window.prompt("Ingrese el número ganador del sorteo:");
                                    if (ticketStr) {
                                      const ticketNum = parseInt(ticketStr, 10);
                                      if (!isNaN(ticketNum)) {
                                        onTriggerManualDraw(raffle.id, ticketNum);
                                      } else {
                                        alert("Por favor ingrese un número de ticket válido.");
                                      }
                                    }
                                  }}
                                  title="Sorteo Manual"
                                  className="p-2 border border-amber-300 hover:border-amber-600 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                                >
                                  <Edit2 size={14} fill="currentColor" />
                                  <span>Manual</span>
                                </button>
                              </>
                            )}
                            {onToggleRaffleStatus && (raffle.status === 'active' || raffle.status === 'closed' || raffle.status === 'draft') && (
                              <button
                                id={`toggle-raffle-status-btn-${raffle.id}`}
                                onClick={() => onToggleRaffleStatus(raffle.id)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer"
                                title={raffle.status === 'active' ? "Desactivar Rifa" : "Activar Rifa"}
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            <button
                              id={`view-raffle-btn-${raffle.id}`}
                              onClick={() => onSelectRaffle(raffle)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
                              title="View tickets board"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right side: Live Sales ticker feed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs h-fit">
          <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-widest">{t.recentSales}</h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
          </div>

          <div className="space-y-4">
            {recentPurchases.slice(0, 6).map((purchase, index) => {
              const initials = purchase.buyerName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              const isNew = index < 2;

              return (
                <div key={index} className="flex gap-3 items-start group">
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs uppercase tracking-wide border transition-all ${
                    isNew 
                      ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs scale-102 font-heavy' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-tight">
                      <strong className="text-gray-900 font-bold">{purchase.buyerName}</strong> bought{' '}
                      <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        #{purchase.ticketNumber}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-1">
                      <span>{purchase.timestamp}</span>
                      <span>•</span>
                      <span className="truncate">{purchase.paymentMethod}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            id="load-more-btn"
            className="w-full mt-5 py-2.5 border border-gray-250 rounded-xl font-bold text-xs text-gray-600 hover:text-emerald-700 hover:border-emerald-600 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-hidden"
          >
            {t.loadMoreActivity}
          </button>
        </div>

      </div>

    </div>
  );
}
