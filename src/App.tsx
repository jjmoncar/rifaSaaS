import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrganizerDashboard from './components/OrganizerDashboard';
import CreateRaffleModal from './components/CreateRaffleModal';
import TicketBoard from './components/TicketBoard';
import PaymentModal from './components/PaymentModal';
import ClientDashboard from './components/ClientDashboard';
import PricingPlans from './components/PricingPlans';
import { Raffle, TicketPurchase, AppNotification, UserProfile, Language } from './types';
import { translations } from './translations';
import { Gift, Award, Calendar, Bell, Volume2, HelpCircle, Flame, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Preset raffle models for high fidelity demonstration
const INITIAL_RAFFLES: Raffle[] = [
  {
    id: 'tesla-model-y',
    name: 'Tesla Model Y Grand Finale',
    description: 'Get behind the wheel of the world\'s best-selling electric SUV equipped with a premium sound system, autopilot capability, and metallic midnight silver paint.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBJnc9KIN_auLYgcud0dQfnj3F9JtlXaBlDtSm_4HQ5jL3xfnANlDJb5A5YW-6p9RMDgxYGXY2t7Lsmt5LRkQBZUgF54Nj3JYLeRqTJMA98rsGb0VgbB0aFTftMY8qmSkvG5vv9fak44SYHDln7kN-yMRwMlwn5S7Yub9l6Epwgtm8jkdw9gKuUGRjG7a_whgmAgFV2UhHpBYkPVeHafrfn0FISpk5lTmV1sYDR4LH_Rn_i0ZJ6LJLTy1fe6KzVZnDDchkUenKr5TQ',
    totalTickets: 100,
    ticketPrice: 10.00,
    currency: 'USD',
    soldTickets: [3, 14, 25, 41, 56, 72, 89],
    reservedTickets: [5],
    purchases: [
      { ticketNumber: '003', buyerName: 'Alex Johnson', buyerEmail: 'alex@example.com', timestamp: '2 hours ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' },
      { ticketNumber: '014', buyerName: 'Mia Silva', buyerEmail: 'mia@example.com', timestamp: '5 hours ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' },
      { ticketNumber: '025', buyerName: 'Alex Johnson', buyerEmail: 'alex@example.com', timestamp: '1 day ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' },
      { ticketNumber: '041', buyerName: 'Lucas Cruz', buyerEmail: 'lucas@gmail.com', timestamp: '1 day ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' },
      { ticketNumber: '056', buyerName: 'Elena Rostova', buyerEmail: 'elena@ru.com', timestamp: '2 days ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' },
      { ticketNumber: '072', buyerName: 'Joe Smith', buyerEmail: 'joe@yahoo.com', timestamp: '2 days ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' },
      { ticketNumber: '089', buyerName: 'Carlos G', buyerEmail: 'carlos@mx.com', timestamp: '3 days ago', paymentMethod: 'Credit Card (Simulated)', status: 'Successful', amount: 10.00, currency: 'USD', raffle: 'Tesla Model Y Grand Finale' }
    ],
    status: 'active',
    drawMethod: 'Automatic',
    subdomain: 'tesla-y',
    startDate: '2026-06-15T12:00',
    drawDate: '2026-06-30T18:00'
  },
  {
    id: 'luxury-villa',
    name: 'Luxury Beachfront Villa',
    description: 'A 5-day fully funded escape to an architectural masterpiece in Angra dos Reis, featuring a private infinity pool, direct beach access, gourmet kitchen & private speedboat tour.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2CwsEqCD-MYPpAnIh4sag2a4IWbng3tHKquQrtUdHNBjvCQ3rL2FDwK02XjagcoXYz_CGPP-_KiMsF8s22T-cXatN35XPIoukvc8f8bZ20z7nKYcJTy0LMFIQXezC8ppt6aCa3eJ_VaN3EtGDCiKX2ThK0Ro8IHukxjEiyWyDxtgAvvKjAqHL55CM1kRE-wDW_rHLIDPXRIJCLpfBXkipXge0nrTOZYBytz1bUTXZGEGF8qt4R-Zjqyiafh_adMKp3vJfd4ecv5Aj',
    totalTickets: 200,
    ticketPrice: 50.00,
    currency: 'BRL',
    soldTickets: [12, 45, 91, 155],
    reservedTickets: [27],
    purchases: [
      { ticketNumber: '012', buyerName: 'Alex Johnson', buyerEmail: 'alex@example.com', timestamp: '4 hours ago', paymentMethod: 'Pix (Brazilian Instant)', status: 'Successful', amount: 50.00, currency: 'BRL', raffle: 'Luxury Beachfront Villa' },
      { ticketNumber: '045', buyerName: 'Bruno Alencar', buyerEmail: 'bruno@br.com', timestamp: '10 hours ago', paymentMethod: 'Pix (Brazilian Instant)', status: 'Successful', amount: 50.00, currency: 'BRL', raffle: 'Luxury Beachfront Villa' },
      { ticketNumber: '091', buyerName: 'Camila Santos', buyerEmail: 'camila@br.com', timestamp: '1 day ago', paymentMethod: 'Pix (Brazilian Instant)', status: 'Successful', amount: 50.00, currency: 'BRL', raffle: 'Luxury Beachfront Villa' },
      { ticketNumber: '155', buyerName: 'Alex Johnson', buyerEmail: 'alex@example.com', timestamp: '2 days ago', paymentMethod: 'Pix (Brazilian Instant)', status: 'Successful', amount: 50.00, currency: 'BRL', raffle: 'Luxury Beachfront Villa' }
    ],
    status: 'active',
    drawMethod: 'Automatic',
    subdomain: 'angra-paraiso',
    startDate: '2026-06-18T08:00',
    drawDate: '2026-06-28T20:00'
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro Titanium Giveaway',
    description: 'Experience Apple\'s ultimate aerospace‑grade titanium build featuring the breakthrough A17 Pro chip, custom Action button, and the strongest camera system in an iPhone yet.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdw-PtwK5GjKBTHZPc4cOkHOzFbRmoyr1hCpKblgFEl1H_K3YpqE1PpnY7Dk26BFmEv4zDjlmtF94AqvU4ifkw6S1xK9s4EgoiWEk7-6dLo2SSJO4WAB4JzEQT3ly_z6yxo35nvFRwQhRLus5LTc7np_V0rZXwJtGFalaW2QbeByZ64Bst2eqCFkjgJvzoepU1VJauSx8irkkmNm5H_byH_YyNLmwZYtX7sPS5ydUdmAjxWDIMkg2qXxVWB5C-SsRNRmvq0k8Guamy',
    totalTickets: 100,
    ticketPrice: 5.00,
    currency: 'Pi',
    soldTickets: [5, 18, 55, 67, 88],
    reservedTickets: [],
    purchases: [
      { ticketNumber: '005', buyerName: 'Alex Johnson', buyerEmail: 'alex@example.com', timestamp: '1 hour ago', paymentMethod: 'Pi Net Wallet', status: 'Successful', amount: 5.00, currency: 'Pi', raffle: 'iPhone 15 Pro Titanium Giveaway' },
      { ticketNumber: '018', buyerName: 'Nico Pi', buyerEmail: 'nico@pinet.org', timestamp: '5 hours ago', paymentMethod: 'Pi Net Wallet', status: 'Successful', amount: 5.00, currency: 'Pi', raffle: 'iPhone 15 Pro Titanium Giveaway' },
      { ticketNumber: '055', buyerName: 'Alex Johnson', buyerEmail: 'alex@example.com', timestamp: '1 day ago', paymentMethod: 'Pi Net Wallet', status: 'Successful', amount: 5.00, currency: 'Pi', raffle: 'iPhone 15 Pro Titanium Giveaway' },
      { ticketNumber: '067', buyerName: 'Satoshi Nakamoto', buyerEmail: 'sat@btc.net', timestamp: '2 days ago', paymentMethod: 'Pi Net Wallet', status: 'Successful', amount: 5.00, currency: 'Pi', raffle: 'iPhone 15 Pro Titanium Giveaway' },
      { ticketNumber: '088', buyerName: 'Yuki Ken', buyerEmail: 'yuki@co.jp', timestamp: '3 days ago', paymentMethod: 'Pi Net Wallet', status: 'Successful', amount: 5.00, currency: 'Pi', raffle: 'iPhone 15 Pro Titanium Giveaway' }
    ],
    status: 'active',
    drawMethod: 'Automatic',
    subdomain: 'iphone-pi',
    startDate: '2026-06-19T00:00',
    drawDate: '2026-06-25T15:00'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: '1', title: 'Payment Confirmed', message: 'Your purchase of ticket #003 in Tesla Model Y Giveaway has been cleared on distributed ledger securely.', timestamp: '2 hours ago', type: 'success', read: false },
  { id: '2', title: 'Tesla Model Y: 89% Sold', message: 'Only 11 tickets left before the automatic draw engine fires! Good luck.', timestamp: '3 hours ago', type: 'info', read: true },
  { id: '3', title: 'Raffle SaaS platform updated', message: 'We have updated our draw mechanisms with independently provable RNG certified hashes.', timestamp: '1 day ago', type: 'info', read: true }
];

export default function App() {
  // Lang state, defaulting to 'es' (Spanish)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const local = localStorage.getItem('rifasaas_lang');
    return (local as Language) || 'es';
  });

  const t = translations[selectedLanguage];

  // User Profile
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    tier: 'Pro',
    rafflesJoinedCount: 3,
    ticketsPurchasedCount: 5
  });

  // Raffles state with local persistence inside localStorage
  const [raffles, setRaffles] = useState<Raffle[]>(() => {
    const local = localStorage.getItem('rifasaas_raffles');
    return local ? JSON.parse(local) : INITIAL_RAFFLES;
  });

  // Alerts inside app
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const local = localStorage.getItem('rifasaas_notifs');
    return local ? JSON.parse(local) : INITIAL_NOTIFICATIONS;
  });

  // Current UX Navigation
  const [userRole, setUserRole] = useState<'organizer' | 'client'>('client');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);

  // Modal displays
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Cart properties
  const [pendingTicketSelection, setPendingTicketSelection] = useState<number[]>([]);
  const [activeRaffleIdForCart, setActiveRaffleIdForCart] = useState<string | null>(null);

  // Celebrate draw results overlay state
  const [drawnCelebrationData, setDrawnCelebrationData] = useState<{
    raffleName: string;
    ticket: string;
    winnerName: string;
    winnerEmail: string;
  } | null>(null);

  // Persists to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('rifasaas_raffles', JSON.stringify(raffles));
  }, [raffles]);

  useEffect(() => {
    localStorage.setItem('rifasaas_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('rifasaas_lang', selectedLanguage);
  }, [selectedLanguage]);

  // Handle language mutation
  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  // Create new raffle and publish live
  const handleCreateRaffleSubmit = (newRaffle: Omit<Raffle, 'id' | 'soldTickets' | 'reservedTickets' | 'purchases' | 'status'>) => {
    const created: Raffle = {
      ...newRaffle,
      id: `raffle-${Date.now()}`,
      soldTickets: [],
      reservedTickets: [],
      purchases: [],
      status: 'active'
    };

    setRaffles([created, ...raffles]);

    // Push alert
    const newAlert: AppNotification = {
      id: `alert-${Date.now()}`,
      title: 'Campanha Publicada',
      message: `Tu nueva campaña ${created.name} está activa en ${created.subdomain}.rifasaas.com.`,
      timestamp: 'Ahora mismo',
      type: 'success',
      read: false
    };
    setNotifications([newAlert, ...notifications]);
  };

  // Payment checkout button handler
  const handlePayClick = (raffleId: string, ticketNumbers: number[]) => {
    setPendingTicketSelection(ticketNumbers);
    setActiveRaffleIdForCart(raffleId);
    setIsPaymentModalOpen(true);
  };

  // Handle verified successful payments
  const handlePaymentSuccess = (purchaser: { name: string; email: string; paymentMethod: string }) => {
    if (!activeRaffleIdForCart) return;

    setRaffles(prevRaffles => {
      return prevRaffles.map(raffle => {
        if (raffle.id !== activeRaffleIdForCart) return raffle;

        // Create transaction metadata
        const newPurchases: TicketPurchase[] = pendingTicketSelection.map(num => ({
          ticketNumber: String(num).padStart(3, '0'),
          buyerName: purchaser.name,
          buyerEmail: purchaser.email,
          timestamp: 'Just now',
          paymentMethod: purchaser.paymentMethod,
          status: 'Successful',
          amount: raffle.ticketPrice,
          currency: raffle.currency,
          raffle: raffle.name
        }));

        const originalSold = [...raffle.soldTickets];
        pendingTicketSelection.forEach(num => {
          if (!originalSold.includes(num)) originalSold.push(num);
        });

        return {
          ...raffle,
          soldTickets: originalSold,
          purchases: [...newPurchases, ...raffle.purchases]
        };
      });
    });

    // Update player dashboard statistics if Alex Johnson bought them
    if (purchaser.email === currentUserProfile.email) {
      setCurrentUserProfile(prev => ({
        ...prev,
        ticketsPurchasedCount: prev.ticketsPurchasedCount + pendingTicketSelection.length,
        rafflesJoinedCount: prev.rafflesJoinedCount + 1
      }));
    }

    // Push secure receipts to alerts list
    const transactionId = `TX-${Date.now().toString().slice(-4)}`;
    const newAlert: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payment Cleared',
      message: `${purchaser.name} purchased tickets ${pendingTicketSelection.map(n => '#' + String(n).padStart(3, '0')).join(', ')} in ${raffles.find(r => r.id === activeRaffleIdForCart)?.name}. Transaction receipt: ${transactionId}.`,
      timestamp: 'Just now',
      type: 'success',
      read: false
    };
    setNotifications([newAlert, ...notifications]);

    // Clear memory
    setPendingTicketSelection([]);
    setActiveRaffleIdForCart(null);
  };

  // Force provably fair automated draw
  const handleTriggerDraw = (raffleId: string) => {
    const raffleToDraw = raffles.find(r => r.id === raffleId);
    if (!raffleToDraw) return;

    // Check if there are tickets sold
    if (raffleToDraw.soldTickets.length === 0) {
      alert(selectedLanguage === 'es' ? 'No se pueden realizar sorteos sin tickets vendidos.' : 'Cannot draw without sold tickets.');
      return;
    }

    // Mark raffle status as 'drawing'
    setRaffles(current => {
      return current.map(r => r.id === raffleId ? { ...r, status: 'drawing' } : r);
    });

    // Run beautiful animated transition timer before revealing winner
    setTimeout(() => {
      // Pick randomly from sold tickets to make a valid winner
      const sold = raffleToDraw.soldTickets;
      const winnerTicketNum = sold[Math.floor(Math.random() * sold.length)];
      
      // Find the purchaser details
      const winningPurchase = raffleToDraw.purchases.find(p => Number(p.ticketNumber) === winnerTicketNum);
      const winnerName = winningPurchase?.buyerName || 'Elena Rostova';
      const winnerEmail = winningPurchase?.buyerEmail || 'elena@gmail.com';

      setRaffles(current => {
        return current.map(r => {
          if (r.id === raffleId) {
            return {
              ...r,
              status: 'drawn',
              winnerTicket: String(winnerTicketNum).padStart(3, '0'),
              winnerName,
              winnerEmail
            };
          }
          return r;
        });
      });

      // Push draw results notification
      const resultAlert: AppNotification = {
        id: `alert-${Date.now()}`,
        title: '🎉 GANADOR CONFIRMADO',
        message: `El boleto #${String(winnerTicketNum).padStart(3, '0')} resultó ganador de la campaña ${raffleToDraw.name}. ¡Felicitaciones a ${winnerName}!`,
        timestamp: 'Ahora mismo',
        type: 'draw',
        read: false
      };
      setNotifications(prev => [resultAlert, ...prev]);

      // Pop active overlay celebration
      setDrawnCelebrationData({
        raffleName: raffleToDraw.name,
        ticket: String(winnerTicketNum).padStart(3, '0'),
        winnerName,
        winnerEmail
      });

    }, 3200);
  };

  // Cumulative transactions catalog
  const cumulativePurchases = raffles.reduce<TicketPurchase[]>((acc, active) => {
    return [...acc, ...active.purchases];
  }, []);

  const handleSelectRaffle = (raffle: Raffle) => {
    setSelectedRaffleId(raffle.id);
    setCurrentTab('home');
  };

  const unreadAlertsCount = notifications.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 font-sans flex flex-col pt-16">
      
      {/* Platform Navigation Header */}
      <Header
        currentLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        userRole={userRole}
        onRoleToggle={(role) => {
          setUserRole(role);
          setSelectedRaffleId(null);
        }}
        userProfile={currentUserProfile}
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'home') {
            setSelectedRaffleId(null);
          }
        }}
        unreadNotificationsCount={unreadAlertsCount}
        onAlertsClick={() => setIsAlertsOpen(true)}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 transition-all">
        
        {/* Dynamic Multi-role views */}
        <AnimatePresence mode="wait">
          
          {userRole === 'organizer' ? (
            
            // ORGANIZER ROLE
            <motion.div
              key="organizer-views"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'dashboard' && (
                <OrganizerDashboard
                  currentLanguage={selectedLanguage}
                  raffles={raffles}
                  recentPurchases={cumulativePurchases}
                  onCreateRaffleClick={() => setIsCreateModalOpen(true)}
                  onSelectRaffle={handleSelectRaffle}
                  onTriggerDraw={handleTriggerDraw}
                />
              )}

              {currentTab === 'pricing' && (
                <PricingPlans currentLanguage={selectedLanguage} />
              )}
            </motion.div>

          ) : (
            
            // CLIENT ROLE
            <motion.div
              key="client-views"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'home' && (
                <>
                  {selectedRaffleId ? (
                    // Display ticket picking grid board
                    <div>
                      <button
                        id="back-to-campaign-list"
                        onClick={() => setSelectedRaffleId(null)}
                        className="mb-4 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer focus:outline-hidden"
                      >
                        ← Volver a Sorteos
                      </button>
                      <TicketBoard
                        currentLanguage={selectedLanguage}
                        raffle={raffles.find(r => r.id === selectedRaffleId)!}
                        onPayClick={handlePayClick}
                        onTriggerDraw={handleTriggerDraw}
                        userRole={userRole}
                      />
                    </div>
                  ) : (
                    // Display all active campaigns Grid
                    <div className="space-y-6">
                      
                      {/* Active Hero Announcement */}
                      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[220px] p-6.5 sm:p-8 flex items-center justify-between shadow-xl border border-slate-800">
                        <div className="relative z-10 max-w-lg space-y-3.5">
                          <span className="bg-emerald-500 text-slate-950 text-[10px] sm:text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest leading-none">
                            Provably Fair Raffle Hub
                          </span>
                          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none">
                            {selectedLanguage === 'es' ? 'Sorteos de Alta Gama' : selectedLanguage === 'pt' ? 'Sorteios de Alta Gama' : 'High-End Verified Giveaways'}
                          </h1>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                            {selectedLanguage === 'es' ? 'Participa de forma segura mediante métodos cifrados instantáneos Pix, Tarjeta de Crédito o Pi Network. Transparencia certificada.' : 'Enter raffle campaigns backed by provably safe automated distribution. Every ticket certified on public ledgers.'}
                          </p>
                        </div>
                        <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-15 sm:opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/80 via-transparent to-transparent" />
                      </section>

                      {/* Active Grid row */}
                      <div className="space-y-4">
                        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">
                          {selectedLanguage === 'es' ? 'Campañas Disponibles' : 'Available Campaigns'}
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {raffles.map((raffle) => {
                            const percent = Math.min(100, Math.round((raffle.soldTickets.length / raffle.totalTickets) * 100));
                            const isDrawn = raffle.status === 'drawn';
                            const currSymbol = raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : 'π';

                            return (
                              <div 
                                id={`public-raffle-card-${raffle.id}`}
                                key={raffle.id}
                                onClick={() => handleSelectRaffle(raffle)}
                                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col"
                              >
                                {/* Cover preview */}
                                <div className="relative aspect-video w-full overflow-hidden shrink-0 border-b border-gray-100">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src={raffle.coverImage} 
                                    alt={raffle.name} 
                                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                                  />
                                  {isDrawn && (
                                    <div className="absolute top-3 right-3 bg-purple-700 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1 z-10 animate-bounce">
                                      <Award size={12} fill="currentColor" /> {t.drawn}
                                    </div>
                                  )}
                                  
                                  {/* Subdomain overlay label */}
                                  <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-md">
                                    {raffle.subdomain}.rifasaas.com
                                  </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                  {/* Title & Desc */}
                                  <div className="space-y-2">
                                    <h3 className="font-extrabold text-gray-901 uppercase tracking-tight text-base group-hover:text-emerald-700 transition-colors leading-snug">
                                      {raffle.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                      {raffle.description}
                                    </p>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                                      <span>{percent}% Vendido</span>
                                      <span>{raffle.soldTickets.length} / {raffle.totalTickets}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden block">
                                      <div className="-mt-0 h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${percent}%` }} />
                                    </div>
                                  </div>

                                  {/* Pricing details and Enter CTA button */}
                                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                                    <div>
                                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Boleto</p>
                                      <p className="text-lg font-black text-emerald-800">
                                        {currSymbol}{raffle.ticketPrice}
                                      </p>
                                    </div>

                                    <button
                                      id={`card-enter-btn-${raffle.id}`}
                                      className="py-2.5 px-4.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-700 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {isDrawn ? 'Ver Resultados' : 'Elegir Números →'}
                                    </button>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Decided Winners Carousel Section */}
                      <section className="bg-white border border-gray-150 p-6.5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2">
                          <Award className="text-purple-600" size={20} />
                          <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-widest">{t.recentNews}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {refflesWithWinners(raffles).map((winnerInfo, idx) => (
                            <div key={idx} className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/30 flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold shrink-0">
                                #{winnerInfo.winnerTicket}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">{winnerInfo.name}</p>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">Ganador: <strong className="text-purple-700 font-bold">{winnerInfo.winnerName}</strong></p>
                                <p className="text-[10px] text-gray-400 font-medium normal-case mt-0.5">E-mail: {winnerInfo.winnerEmail}</p>
                              </div>
                            </div>
                          ))}
                          
                          {refflesWithWinners(raffles).length === 0 && (
                            <div className="col-span-2 py-4 text-center">
                              <p className="text-xs text-gray-400 font-medium">No se han realizado sorteos todavía. ¡Ejecuta uno desde la pestaña SaaS Admin!</p>
                            </div>
                          )}
                        </div>
                      </section>

                    </div>
                  )}
                </>
              )}

              {currentTab === 'mytickets' && (
                <ClientDashboard
                  currentLanguage={selectedLanguage}
                  userProfile={currentUserProfile}
                  purchases={cumulativePurchases.filter(p => p.buyerEmail === currentUserProfile.email)}
                  raffles={raffles}
                  notifications={notifications}
                  onSelectRaffle={handleSelectRaffle}
                />
              )}

              {currentTab === 'pricing' && (
                <PricingPlans currentLanguage={selectedLanguage} />
              )}

              {currentTab === 'profile' && (
                <ClientDashboard
                  currentLanguage={selectedLanguage}
                  userProfile={currentUserProfile}
                  purchases={cumulativePurchases.filter(p => p.buyerEmail === currentUserProfile.email)}
                  raffles={raffles}
                  notifications={notifications}
                  onSelectRaffle={handleSelectRaffle}
                />
              )}
            </motion.div>

          )}

        </AnimatePresence>

      </main>

      {/* Floating Alerts Drawer Modal Side area */}
      <AnimatePresence>
        {isAlertsOpen && (
          <div className="fixed inset-0 z-105 overflow-hidden">
            <div 
              id="alerts-backdrop-overlay"
              onClick={() => setIsAlertsOpen(false)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-3xs" 
            />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-sm max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-150"
              >
                {/* Header bar */}
                <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="text-emerald-700" size={18} />
                    <h3 className="font-extrabold text-sm text-gray-901 uppercase tracking-wider">Centro de Notificaciones</h3>
                  </div>
                  <button
                    id="close-alerts-drawer"
                    onClick={() => setIsAlertsOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Notifications list */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-150">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-emerald-50/15' : ''}`}
                      onClick={() => {
                        // Mark as read
                        setNotifications(current => 
                          current.map(n => n.id === notif.id ? { ...n, read: true } : n)
                        );
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                          notif.type === 'success' 
                            ? 'bg-emerald-600' 
                            : notif.type === 'draw'
                            ? 'bg-purple-600 animate-ping'
                            : 'bg-amber-600'
                        }`} />
                        
                        <div className="flex-1 pl-3">
                          <p className="text-xs font-extrabold text-gray-900 uppercase tracking-tight">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1 leading-normal">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 block font-mono">{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="py-24 text-center">
                      <p className="text-gray-400 font-semibold text-xs">No hay alertas disponibles.</p>
                    </div>
                  )}
                </div>

                {/* Clear all tool */}
                <div className="p-4 border-t border-gray-150 bg-gray-50 flex gap-2">
                  <button
                    id="clear-all-alerts-btn"
                    onClick={() => {
                      setNotifications([]);
                      setIsAlertsOpen(false);
                    }}
                    className="w-full bg-white hover:bg-gray-100 border border-gray-250 py-2 rounded-lg text-xs font-semibold text-gray-751 cursor-pointer"
                  >
                    Clear All Alerts
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW RAFFLE MODAL POPUP OVERLAY */}
      <CreateRaffleModal
        currentLanguage={selectedLanguage}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRaffleSubmit}
      />

      {/* SIMULATED PAYMENT DIALOG MODAL POPUP OVERLAY */}
      {isPaymentModalOpen && activeRaffleIdForCart && (
        <PaymentModal
          currentLanguage={selectedLanguage}
          raffle={raffles.find(r => r.id === activeRaffleIdForCart)!}
          ticketNumbers={pendingTicketSelection}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPendingTicketSelection([]);
            setActiveRaffleIdForCart(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* DRAW COMPLETED GRAND CELEBRATION WINNER BANNER MODAL POPUP */}
      <AnimatePresence>
        {drawnCelebrationData && (
          <div className="fixed inset-0 z-200 overflow-y-auto flex items-center justify-center p-4">
            <div 
              id="celebrate-backdrop"
              onClick={() => setDrawnCelebrationData(null)} 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" 
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-indigo-500/30 text-center space-y-6 overflow-hidden"
            >
              
              {/* Confetti simulation rays */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse" />
              </div>

              <div className="relative z-10 space-y-4">
                
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-yellow-500/20 animate-bounce scale-102">
                  <Award size={38} strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                  <p className="text-yellow-400 text-xs font-black uppercase tracking-widest leading-none">
                    {t.weHaveAWinner}
                  </p>
                  <h2 className="text-xl font-black text-white px-2 mt-2 leading-tight">
                    {drawnCelebrationData.raffleName}
                  </h2>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/10 p-5 rounded-2xl inline-block space-y-2 w-full">
                  <p className="text-[10px] text-zinc-300 font-extrabold uppercase tracking-widest">Boleto Ganador</p>
                  <p className="text-4xl font-mono font-black text-amber-400 tracking-wider">
                    #{drawnCelebrationData.ticket}
                  </p>
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <p className="text-sm font-bold text-gray-50">{drawnCelebrationData.winnerName}</p>
                    <p className="text-[11px] text-zinc-400 font-semibold font-mono mt-0.5">{drawnCelebrationData.winnerEmail}</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-normal leading-relaxed">
                  {t.notifySuccess}
                </p>

                <button
                  id="celebrate-close-btn"
                  onClick={() => setDrawnCelebrationData(null)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-widest active:scale-97 transition-all mt-4 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Continuar
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simple decorative footer */}
      <footer className="py-8 border-t border-gray-200 mt-12 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs text-gray-400 space-y-1.5 leading-normal">
          <p>© 2026 RifaSaaS Inc. Decarbonized mobile raffle ledger. All rights reserved.</p>
          <p className="font-mono">Provably Fair Core • API Version v2.4.0 • Port 3000 Ingress Routing</p>
        </div>
      </footer>

    </div>
  );
}

// Internal helper to return clean drawn list
function refflesWithWinners(raffles: Raffle[]) {
  const drawn = raffles.filter(r => r.status === 'drawn' && r.winnerTicket);
  return drawn.map(d => ({
    name: d.name,
    winnerTicket: d.winnerTicket,
    winnerName: d.winnerName,
    winnerEmail: d.winnerEmail
  }));
}
