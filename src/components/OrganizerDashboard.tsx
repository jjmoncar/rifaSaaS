import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, Raffle, TicketPurchase } from '../types';
import { Play, Eye, Edit2, TrendingUp, Users, Ticket, DollarSign, Award, ArrowUpRight, CheckCircle, BarChart3, PieChart, Trophy, CreditCard, AlertCircle, Target, Activity, Scale, ChevronRight } from 'lucide-react';

interface OrganizerDashboardProps {
  currentLanguage: Language;
  raffles: Raffle[];
  recentPurchases: TicketPurchase[];
  userTier: string;
  onCreateRaffleClick: () => void;
  onSelectRaffle: (raffle: Raffle) => void;
  onTriggerDraw: (raffleId: string) => void;
  onEditRaffle: (raffle: Raffle) => void;
  onPayPrize: (raffleId: string) => void;
  onToggleRaffleStatus?: (raffleId: string) => void;
  onTriggerManualDraw: (raffleId: string, ticketNum: number) => void;
}

export default function OrganizerDashboard({
  currentLanguage,
  raffles,
  recentPurchases,
  userTier,
  onCreateRaffleClick,
  onSelectRaffle,
  onEditRaffle,
  onPayPrize,
  onTriggerDraw,
  onToggleRaffleStatus,
  onTriggerManualDraw
}: OrganizerDashboardProps) {
  const t = translations[currentLanguage];

  const [hideDrawn, setHideDrawn] = React.useState(false);

  // Calculate high-fidelity dashboard metrics based on actual state
  const activeRafflesCount = raffles.filter(r => r.status === 'active' || r.status === 'drawing').length;
  
  const maxActiveRaffles = userTier === 'Free' || userTier === 'Starter' ? 1 
                         : userTier === 'Medium' ? 20 
                         : userTier === 'Pro' ? 30 
                         : 100;
  const isLimitReached = activeRafflesCount >= maxActiveRaffles;
  
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
  const uniqueBuyersCount = uniqueEmails.size;

  // Get first active raffle for the Progress HUD Card
  const activeRaffle = raffles.find(r => r.status === 'active' || r.status === 'drawing') || raffles[0];
  const completionPercent = activeRaffle 
    ? Math.min(100, Math.round((activeRaffle.soldTickets.length / activeRaffle.totalTickets) * 100))
    : 0;

  // Filter for real-time reports: 'all' or specific raffle ID
  const [reportFilterRaffleId, setReportFilterRaffleId] = useState<string>('all');

  const selectedRafflesForReport = reportFilterRaffleId === 'all'
    ? raffles
    : raffles.filter(r => r.id === reportFilterRaffleId);

  // 1. Recaudación actual vs. Meta (Barra de progreso visual)
  const repCurrentRevenue = selectedRafflesForReport.reduce((acc, r) => {
    const succ = r.purchases.filter(p => p.status === 'Successful').reduce((sum, p) => sum + p.amount, 0);
    return acc + succ;
  }, 0);

  const repTargetGoal = selectedRafflesForReport.reduce((acc, r) => {
    const goal = r.targetGoal !== undefined && r.targetGoal > 0
      ? r.targetGoal
      : (r.totalTickets * r.ticketPrice);
    return acc + goal;
  }, 0);

  const repGoalPercent = repTargetGoal > 0
    ? Math.min(100, Math.round((repCurrentRevenue / repTargetGoal) * 100))
    : 0;

  const repRemainingGoal = Math.max(0, repTargetGoal - repCurrentRevenue);

  // 2. Boletos disponibles vs. Boletos vendidos vs. Boletos reservados
  const repTotalTickets = selectedRafflesForReport.reduce((acc, r) => acc + r.totalTickets, 0);
  const repSoldTickets = selectedRafflesForReport.reduce((acc, r) => acc + r.soldTickets.length, 0);
  const repReservedTickets = selectedRafflesForReport.reduce((acc, r) => acc + (r.reservedTickets ? r.reservedTickets.length : 0), 0);
  const repAvailableTickets = Math.max(0, repTotalTickets - repSoldTickets - repReservedTickets);

  const repSoldPct = repTotalTickets > 0 ? Math.round((repSoldTickets / repTotalTickets) * 100) : 0;
  const repReservedPct = repTotalTickets > 0 ? Math.round((repReservedTickets / repTotalTickets) * 100) : 0;
  const repAvailablePct = repTotalTickets > 0 ? Math.max(0, 100 - repSoldPct - repReservedPct) : 0;

  // 3. Punto de equilibrio alcanzado (Sí / No)
  const repBreakEvenCost = selectedRafflesForReport.reduce((acc, r) => {
    const cost = r.breakEvenCost !== undefined && r.breakEvenCost >= 0
      ? r.breakEvenCost
      : (r.totalTickets * r.ticketPrice * 0.5);
    return acc + cost;
  }, 0);

  const isBreakEvenReached = repCurrentRevenue >= repBreakEvenCost;
  const repBreakEvenPct = repBreakEvenCost > 0
    ? Math.min(100, Math.round((repCurrentRevenue / repBreakEvenCost) * 100))
    : 0;
  const repBreakEvenDiff = Math.max(0, repBreakEvenCost - repCurrentRevenue);

  // 4. Ventas por canal de pago (PayPal, PIX)
  const paymentChannelMap: Record<string, { name: string; amount: number; count: number; badgeColor: string; key: string }> = {};

  selectedRafflesForReport.forEach(r => {
    r.purchases.forEach(p => {
      if (p.status === 'Successful') {
        let channelName = p.paymentMethod || 'Otros';
        let key = 'other';
        let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';

        if (channelName.toLowerCase().includes('pix')) {
          channelName = 'PIX (Pagos Instantáneos)';
          key = 'pix';
          badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
        } else if (channelName.toLowerCase().includes('paypal')) {
          channelName = 'PayPal';
          key = 'paypal';
          badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
        } else if (channelName.toLowerCase().includes('card') || channelName.toLowerCase().includes('tarjeta')) {
          channelName = 'Tarjeta de Crédito';
          key = 'card';
          badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
        } else if (channelName.toLowerCase().includes('pi')) {
          channelName = 'Pi Network Wallet';
          key = 'pi';
          badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
        }

        if (!paymentChannelMap[channelName]) {
          paymentChannelMap[channelName] = { name: channelName, amount: 0, count: 0, badgeColor, key };
        }
        paymentChannelMap[channelName].amount += p.amount;
        paymentChannelMap[channelName].count += 1;
      }
    });
  });

  const paymentChannelsList = Object.values(paymentChannelMap).sort((a, b) => b.amount - a.amount);
  const totalChannelRevenue = paymentChannelsList.reduce((acc, c) => acc + c.amount, 0);

  // 5. Top de compradores
  const buyerMap: Record<string, { name: string; email: string; totalTickets: number; totalSpent: number }> = {};

  selectedRafflesForReport.forEach(r => {
    r.purchases.forEach(p => {
      if (p.status === 'Successful' && (p.buyerEmail || p.buyerName)) {
        const key = p.buyerEmail ? p.buyerEmail.toLowerCase() : p.buyerName.toLowerCase();
        if (!buyerMap[key]) {
          buyerMap[key] = {
            name: p.buyerName || 'Comprador Anónimo',
            email: p.buyerEmail || 'sin-email@rifasaas.com',
            totalTickets: 0,
            totalSpent: 0
          };
        }
        buyerMap[key].totalTickets += 1;
        buyerMap[key].totalSpent += p.amount;
      }
    });
  });

  const topBuyersList = Object.values(buyerMap)
    .sort((a, b) => b.totalTickets !== a.totalTickets ? b.totalTickets - a.totalTickets : b.totalSpent - a.totalSpent)
    .slice(0, 5);

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
        <div className="flex flex-col items-end">
          <button
            id="hero-create-raffle-btn"
            onClick={isLimitReached ? undefined : onCreateRaffleClick}
            disabled={isLimitReached}
            className={`${isLimitReached ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-97 shadow-lg shadow-emerald-700/10'} font-semibold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2`}
          >
            <span className="text-lg font-bold">+</span>
            {t.createNewRaffle}
          </button>
          {isLimitReached && (
            <span className="text-[10px] text-red-500 font-semibold mt-1">Límite de plan alcanzado ({activeRafflesCount}/{maxActiveRaffles})</span>
          )}
        </div>
      </div>

      {/* KPI Grid HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Revenue card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <DollarSign size={20} />
            </div>

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

          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.completion}</p>
            <p className="text-2xl font-extrabold text-gray-905 mt-1">
              {completionPercent}%
            </p>
          </div>
        </div>

      </div>

      {/* Real-Time Analytics & 5 Core Reports Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
        
        {/* Reports Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  {t.realTimeReportsTitle || 'Reportes y Analíticas en Tiempo Real'}
                </h2>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {t.realTimeReportsSub || 'Monitoreo en vivo de ingresos, boletos, punto de equilibrio y compradores.'}
              </p>
            </div>
          </div>

          {/* Campaign Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500">{t.selectRaffleFilter || 'Filtrar'}:</span>
            <select
              id="report-raffle-filter"
              value={reportFilterRaffleId}
              onChange={(e) => setReportFilterRaffleId(e.target.value)}
              className="bg-gray-50 border border-gray-250 text-xs font-bold text-gray-800 rounded-xl px-3 py-2 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">{t.allRafflesView || 'Todas las Rifas (Vista Global)'}</option>
              {raffles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 Real-Time Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Reporte 1: Recaudación actual vs. Meta */}
          <div className="bg-gradient-to-br from-emerald-50/60 via-white to-gray-50/50 p-5 rounded-xl border border-emerald-100/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <Target size={16} className="text-emerald-600" />
                <span>{t.revenueVsGoal || '1. Recaudación vs. Meta'}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${repGoalPercent >= 100 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-50 text-emerald-700'}`}>
                {repGoalPercent}%
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-gray-900">
                  ${repCurrentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  / ${repTargetGoal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {repGoalPercent >= 100 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle size={12} /> {t.goalReached || '¡Meta Alcanzada!'}
                  </span>
                ) : (
                  <span>{t.remainingToGoal || 'Faltan'}: <strong className="text-gray-800">${repRemainingGoal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                )}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-150 h-3 rounded-full overflow-hidden block">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${repGoalPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Reporte 2: Boletos disponibles vs. Boletos vendidos vs. Boletos reservados */}
          <div className="bg-gradient-to-br from-blue-50/40 via-white to-gray-50/50 p-5 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <Ticket size={16} className="text-blue-600" />
                <span>{t.ticketInventoryBreakdown || '2. Boletos (Inventario)'}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                {repTotalTickets} total
              </span>
            </div>

            <div className="my-3 space-y-2">
              {/* Tri-color Segmented Progress Bar */}
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex block shadow-inner">
                <div
                  title={`Vendidos: ${repSoldTickets} (${repSoldPct}%)`}
                  className="bg-emerald-600 h-full transition-all duration-700"
                  style={{ width: `${repSoldPct}%` }}
                />
                <div
                  title={`Reservados: ${repReservedTickets} (${repReservedPct}%)`}
                  className="bg-amber-500 h-full transition-all duration-700"
                  style={{ width: `${repReservedPct}%` }}
                />
                <div
                  title={`Disponibles: ${repAvailableTickets} (${repAvailablePct}%)`}
                  className="bg-gray-200 h-full transition-all duration-700"
                  style={{ width: `${repAvailablePct}%` }}
                />
              </div>

              {/* Counts legend */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">{t.soldTicketsLabel || 'Vendidos'}</p>
                  <p className="text-sm font-extrabold text-emerald-900">{repSoldTickets}</p>
                  <p className="text-[9px] text-emerald-600 font-semibold">{repSoldPct}%</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-1.5 rounded-lg">
                  <p className="text-[10px] font-bold text-amber-800 uppercase">{t.reservedTicketsLabel || 'Reservados'}</p>
                  <p className="text-sm font-extrabold text-amber-900">{repReservedTickets}</p>
                  <p className="text-[9px] text-amber-600 font-semibold">{repReservedPct}%</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-1.5 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">{t.availableTickets || 'Disponibles'}</p>
                  <p className="text-sm font-extrabold text-gray-800">{repAvailableTickets}</p>
                  <p className="text-[9px] text-gray-500 font-semibold">{repAvailablePct}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reporte 3: Punto de equilibrio alcanzado (Sí / No) */}
          <div className={`p-5 rounded-xl border shadow-2xs flex flex-col justify-between transition-all ${
            isBreakEvenReached 
              ? 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-50/30 border-emerald-300'
              : 'bg-gradient-to-br from-amber-500/10 via-white to-amber-50/30 border-amber-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-gray-800">
                <Scale size={16} className={isBreakEvenReached ? 'text-emerald-600' : 'text-amber-600'} />
                <span>{t.breakEvenPoint || '3. Punto de Equilibrio'}</span>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs ${
                isBreakEvenReached
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-amber-500 text-white shadow-amber-500/20'
              }`}>
                {isBreakEvenReached ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                {isBreakEvenReached ? `${t.breakEvenYes || 'Sí'} - Alcanzado` : `${t.breakEvenNo || 'No'} - Pendiente`}
              </span>
            </div>

            <div className="my-3 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-500 font-semibold">{t.breakEvenCostLabel || 'Umbral Costo'}:</span>
                <span className="text-sm font-extrabold text-gray-900">${repBreakEvenCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-500 font-semibold">{t.currentRevenueLabel || 'Recaudado'}:</span>
                <span className="text-sm font-extrabold text-emerald-700">${repCurrentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden block mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isBreakEvenReached ? 'bg-emerald-600' : 'bg-amber-500'}`}
                  style={{ width: `${repBreakEvenPct}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-600 italic leading-snug">
              {isBreakEvenReached
                ? (t.breakEvenDescReached || '¡Excelente! La campaña ya ha cubierto sus costos y genera ganancias.')
                : (t.breakEvenDescPending ? t.breakEvenDescPending.replace('{amount}', `$${repBreakEvenDiff.toFixed(2)}`) : `Faltan $${repBreakEvenDiff.toFixed(2)} para cubrir el costo de equilibrio.`)}
            </p>
          </div>

        </div>

        {/* Reports Grid Row 2: Payment Channels (PayPal, PIX) & Top Buyers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">

          {/* Reporte 4: Ventas por canal de pago (PayPal, PIX) */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                    {t.paymentChannelSales || '4. Ventas por Canal de Pago (PayPal, PIX)'}
                  </h3>
                  <p className="text-[11px] text-gray-500">Distribución de ingresos por pasarela</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                ${totalChannelRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {paymentChannelsList.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">
                {t.noPaymentData || 'Sin transacciones completadas aún.'}
              </p>
            ) : (
              <div className="space-y-3">
                {paymentChannelsList.map((ch, idx) => {
                  const sharePct = totalChannelRevenue > 0 ? Math.round((ch.amount / totalChannelRevenue) * 100) : 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${ch.badgeColor}`}>
                          {ch.name}
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-gray-900">
                            ${ch.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-2 font-semibold">({ch.count} txn - {sharePct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden block">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            ch.key === 'pix' ? 'bg-teal-500' : ch.key === 'paypal' ? 'bg-blue-600' : 'bg-purple-600'
                          }`}
                          style={{ width: `${sharePct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reporte 5: Top de compradores */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                    {t.topBuyers || '5. Top de Compradores'}
                  </h3>
                  <p className="text-[11px] text-gray-500">{t.topBuyersSub || 'Clientes con mayor volumen de boletos comprados'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Leaderboard
              </span>
            </div>

            {topBuyersList.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">
                {t.noBuyersYet || 'No hay registros de compras aún.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {topBuyersList.map((buyer, index) => {
                  const initials = buyer.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const rankColor = index === 0 ? 'bg-amber-400 text-amber-950 border-amber-300'
                                  : index === 1 ? 'bg-slate-300 text-slate-800 border-slate-200'
                                  : index === 2 ? 'bg-amber-700/80 text-amber-50 border-amber-600'
                                  : 'bg-gray-100 text-gray-700 border-gray-200';

                  return (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank medal badge */}
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-extrabold text-xs border shadow-2xs ${rankColor}`}>
                          #{index + 1}
                        </div>
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{buyer.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{buyer.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {buyer.totalTickets} {buyer.totalTickets === 1 ? 'boleto' : 'boletos'}
                        </span>
                        <p className="text-[11px] font-bold text-gray-700 mt-0.5">
                          ${buyer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                <input 
                  type="checkbox" 
                  checked={hideDrawn} 
                  onChange={(e) => setHideDrawn(e.target.checked)} 
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                />
                {currentLanguage === 'es' ? 'Ocultar sorteadas' : currentLanguage === 'pt' ? 'Ocultar sorteadas' : 'Hide drawn'}
              </label>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-3">{t.campaign}</th>
                    <th className="px-6 py-3">{t.status}</th>
                    <th className="px-6 py-3">{t.pricePerTicket}</th>
                    <th className="px-6 py-3">{t.revenue}</th>
                    <th className="px-6 py-3 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {raffles
                    .filter(raffle => hideDrawn ? raffle.status !== 'drawn' : true)
                    .map((raffle) => {
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
                        <td className="px-6 py-4.5 font-semibold text-sm text-gray-700">
                          {raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : raffle.currency === 'VES' ? 'Bs.' : raffle.currency === 'SOL' ? 'S/' : 'π'}
                          {raffle.ticketPrice.toLocaleString('en-US', { minimumFractionDigits: raffle.currency === 'Pi' ? 0 : 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4.5 font-bold text-sm text-gray-800">
                          {raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : raffle.currency === 'VES' ? 'Bs.' : raffle.currency === 'SOL' ? 'S/' : 'π'}
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
                            
                            {raffle.status === 'drawn' && (
                              raffle.prizePaid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-100">
                                  <CheckCircle size={14} className="text-emerald-500" />
                                  Premio Pagado
                                </span>
                              ) : (
                                <button
                                  onClick={() => onPayPrize(raffle.id)}
                                  title="Pagar Premio"
                                  className="px-3 py-1.5 border border-blue-300 hover:border-blue-600 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider shadow-xs"
                                >
                                  <DollarSign size={14} strokeWidth={3} />
                                  Pagar Premio
                                </button>
                              )
                            )}

                            <button
                              id={`edit-raffle-btn-${raffle.id}`}
                              onClick={() => onEditRaffle(raffle)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Editar Rifa"
                            >
                              <Edit2 size={16} />
                            </button>
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
