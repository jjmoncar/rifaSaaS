import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Raffle } from '../types';
import { Search, ShoppingBag, Lock, CheckCircle, Clock, Gift, Award, Play, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TicketBoardProps {
  currentLanguage: Language;
  raffle: Raffle;
  onPayClick: (raffleId: string, ticketNumbers: number[]) => void;
  onTriggerDraw: (raffleId: string) => void;
  userRole: 'organizer' | 'client';
}

export default function TicketBoard({
  currentLanguage,
  raffle,
  onPayClick,
  onTriggerDraw,
  userRole
}: TicketBoardProps) {
  const t = translations[currentLanguage];

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  
  // Rolling drawing visual states
  const [isDrawing, setIsDrawing] = useState(raffle.status === 'drawing');
  const [currentRollingTicket, setCurrentRollingTicket] = useState<number | null>(null);

  // Sync isDrawing state with raffle status
  useEffect(() => {
    setIsDrawing(raffle.status === 'drawing');
  }, [raffle.status]);

  // Clean selections when changing raffle
  useEffect(() => {
    setSelectedTickets([]);
  }, [raffle.id]);

  // Effect to handle rolling drawer animation
  useEffect(() => {
    if (!isDrawing) {
      setCurrentRollingTicket(null);
      return;
    }

    let intervalId: any;
    let ticksStr = 0;
    const maxTicks = 25; // number of cycles/flashes

    intervalId = setInterval(() => {
      // Pick a random sold ticket to flash, or just any random ticket
      const randomIndex = Math.floor(Math.random() * raffle.totalTickets) + 1;
      setCurrentRollingTicket(randomIndex);
      
      ticksStr++;
      if (ticksStr >= maxTicks) {
        clearInterval(intervalId);
      }
    }, 120);

    return () => clearInterval(intervalId);
  }, [isDrawing, raffle.totalTickets]);

  const toggleSelectTicket = (num: number) => {
    if (raffle.soldTickets.includes(num) || raffle.reservedTickets.includes(num)) return;

    if (selectedTickets.includes(num)) {
      setSelectedTickets(selectedTickets.filter(n => n !== num));
    } else {
      setSelectedTickets([...selectedTickets, num]);
    }
  };

  const handleCheckout = () => {
    if (selectedTickets.length === 0) return;
    onPayClick(raffle.id, selectedTickets);
  };

  // Filter & Search Tickets list
  const ticketArr: { num: number; status: 'sold' | 'reserved' | 'available' }[] = [];
  for (let i = 1; i <= raffle.totalTickets; i++) {
    let status: 'sold' | 'reserved' | 'available' = 'available';
    if (raffle.soldTickets.includes(i)) status = 'sold';
    else if (raffle.reservedTickets.includes(i)) status = 'reserved';

    ticketArr.push({ num: i, status });
  }

  const queryClean = searchTerm.trim().replace(/^0+/, '');
  const filteredTickets = ticketArr.filter(t => {
    // Search
    if (queryClean !== '') {
      if (!t.num.toString().includes(queryClean)) return false;
    }

    // Filter status
    if (filter === 'available') return t.status === 'available';
    if (filter === 'sold') return t.status === 'sold' || t.status === 'reserved';
    return true;
  });

  const currencySymbol = raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : 'π';
  const displayPrice = (selectedTickets.length * raffle.ticketPrice).toLocaleString('en-US', {
    minimumFractionDigits: raffle.currency === 'Pi' ? 0 : 2,
    maximumFractionDigits: 2
  });

  // Derived progress values
  const soldCount = raffle.soldTickets.length;
  const reservedCount = raffle.reservedTickets.length;
  const progressRatio = Math.min(100, Math.round((soldCount / raffle.totalTickets) * 100));

  // Determine ticket background on grid depending on states
  const getTicketColorStyle = (num: number, status: 'sold' | 'reserved' | 'available') => {
    const isSelected = selectedTickets.includes(num);
    const isRollingWinner = currentRollingTicket === num;

    if (raffle.status === 'drawn' && Number(raffle.winnerTicket) === num) {
      return 'bg-purple-600 border-purple-700 text-white scale-102 font-bold animate-bounce shadow-xl';
    }

    if (isRollingWinner) {
      return 'bg-amber-500 border-amber-600 text-white scale-105 shadow-md duration-75';
    }

    if (isSelected) {
      return 'bg-emerald-700 border-emerald-800 text-white scale-103 shadow-lg font-bold';
    }

    if (status === 'sold') {
      return 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50';
    }

    if (status === 'reserved') {
      return 'bg-amber-100 border-amber-200 text-amber-800 cursor-not-allowed font-medium';
    }

    return 'bg-white border-emerald-100 text-emerald-800 hover:border-emerald-600 hover:bg-emerald-50 hover:scale-102';
  };

  return (
    <div className="space-y-6 pb-28">
      
      {/* Back to list or Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title area */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
            <Gift size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-909 uppercase tracking-tight">{raffle.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5 max-w-lg leading-relaxed">{raffle.description}</p>
          </div>
        </div>

        {/* Dynamic CTA for Organizer when inspecting this raffle */}
        {userRole === 'organizer' && raffle.status === 'active' && (
          <button
            id="draw-now-trigger-board"
            onClick={() => onTriggerDraw(raffle.id)}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-700/10 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play size={14} fill="currentColor" />
            <span>{t.runAutomatedDraw}</span>
          </button>
        )}

        {/* Drawn state announcement HUD widget */}
        {raffle.status === 'drawn' && (
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl flex items-center gap-3 self-stretch md:self-auto uppercase tracking-wide shrink-0">
            <Award className="text-purple-600 animate-pulse shrink-0" size={24} />
            <div>
              <p className="text-[10px] text-purple-700 font-extrabold tracking-wider leading-none">GANADOR NOTIFICADO</p>
              <p className="text-xs font-bold text-gray-900 mt-1 leading-tight">
                {t.weHaveAWinner}: <span className="text-purple-700 font-bold">Ticket #{raffle.winnerTicket}</span>
              </p>
              <p className="text-[10px] text-gray-500 font-medium normal-case mt-0.5">{raffle.winnerName}</p>
            </div>
          </div>
        )}

      </div>

      {/* Progress metrics widget */}
      <section className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">{t.chooseLuckyNumbers}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t.chooseLuckySub}</p>
          </div>
          <div className="text-right sm:text-right w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-700">{soldCount} vendidos</span>
            <span className="text-xs text-gray-400"> / {raffle.totalTickets} total</span>
          </div>
        </div>

        {/* Visual progress bar bar */}
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden block">
          <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${progressRatio}%` }} />
        </div>

      </section>

      {/* Metric Cards Bento-ish layout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-white border border-gray-150 p-4.5 rounded-xl flex items-center gap-4.5 hover:shadow-xs transition-shadow">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold shadow-2xs shrink-0">
            <Ticket size={20} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.totalTickets}</p>
            <p className="text-xl font-black text-gray-800">{raffle.totalTickets.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 p-4.5 rounded-xl flex items-center gap-4.5 hover:shadow-xs transition-shadow">
          <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-500 font-bold shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.sold}</p>
            <p className="text-xl font-black text-gray-800">{soldCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 p-4.5 rounded-xl flex items-center gap-4.5 hover:shadow-xs transition-shadow">
          <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.reserved}</p>
            <p className="text-xl font-black text-gray-800">{reservedCount.toLocaleString()}</p>
          </div>
        </div>

      </section>

      {/* Sliders and filters sticky top HUD */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-16 bg-gray-50 py-3 z-30 transition-all">
        
        {/* Search capability */}
        <div className="relative w-full sm:max-w-xs block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="ticket-search-box"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchNumber}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-901 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-mono"
          />
        </div>

        {/* Tab-styled sliding filters All Available Sold */}
        <div className="flex bg-gray-150 p-1 rounded-xl w-full sm:w-auto shadow-inner border border-gray-200">
          <button
            id="filter-tickets-all-btn"
            onClick={() => setFilter('all')}
            className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            id="filter-tickets-available-btn"
            onClick={() => setFilter('available')}
            className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all ${
              filter === 'available'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.filterAvailable}
          </button>
          <button
            id="filter-tickets-sold-btn"
            onClick={() => setFilter('sold')}
            className={`flex-1 sm:px-6 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all ${
              filter === 'sold'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.filterSold}
          </button>
        </div>

      </section>

      {/* Generate interactive Grid of tiles */}
      <section className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2.5 md:gap-3.5">
            {filteredTickets.map(({ num, status }) => {
              const numFormatted = num.toString().padStart(3, '0');
              const isSelected = selectedTickets.includes(num);

              return (
                <button
                  id={`ticket-tile-${num}`}
                  key={num}
                  type="button"
                  disabled={status === 'sold' || status === 'reserved'}
                  onClick={() => toggleSelectTicket(num)}
                  title={
                    status === 'sold'
                      ? 'Sold of this campaign'
                      : status === 'reserved'
                      ? t.beingPurchasedInfo
                      : `Ticket #${numFormatted}`
                  }
                  className={`aspect-square w-full rounded-xl border flex items-center justify-center font-mono font-bold text-xs md:text-sm cursor-pointer select-none transition-all ${getTicketColorStyle(num, status)}`}
                >
                  {numFormatted}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-400 font-semibold text-sm">No tickets found matches "{searchTerm}"</p>
          </div>
        )}
      </section>

      {/* Bottom Sticky select cart/checkout panel */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-45 px-4 py-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Displaying selected numbers catalog */}
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 animate-bounce">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{t.selectedNumbers}</p>
                <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-0.5 truncate max-w-[280px] sm:max-w-[480px]">
                  {selectedTickets.map(n => '#' + n.toString().padStart(3, '0')).join(', ')}
                </p>
              </div>
            </div>

            {/* Displaying checkout triggers and accumulation sums */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.totalAmount}</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-700">
                  {currencySymbol}{displayPrice}
                </p>
              </div>
              
              <button
                id="pay-tickets-cart-btn"
                onClick={handleCheckout}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-700/10 active:scale-97 transition-all cursor-pointer"
              >
                <span>{t.payNow}</span>
                <Lock size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
