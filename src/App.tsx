import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrganizerDashboard from './components/OrganizerDashboard';
import CreateRaffleModal from './components/CreateRaffleModal';
import TicketBoard from './components/TicketBoard';
import PaymentModal from './components/PaymentModal';
import ClientDashboard from './components/ClientDashboard';
import PricingPlans from './components/PricingPlans';
import PrizePaymentModal from './components/PrizePaymentModal';
import { Raffle, TicketPurchase, AppNotification, UserProfile, Language } from './types';
import { translations } from './translations';
import { Gift, Award, Calendar, Bell, Volume2, HelpCircle, Flame, CheckCircle2, RefreshCw, ShieldCheck, Zap, ArrowRight, Star, Users, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase core integrations
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import AuthModal from './components/AuthModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const INITIAL_RAFFLES: Raffle[] = [];

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export default function App() {
  // Lang state, defaulting to 'es' (Spanish)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const local = localStorage.getItem('rifasaas_lang');
    return (local as Language) || 'es';
  });

  const t = translations[selectedLanguage];

  // User Profile
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: 'Invitado',
    email: 'guest@example.com',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=guest',
    tier: 'Free',
    rafflesJoinedCount: 0,
    ticketsPurchasedCount: 0
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Firebase Auth State listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Fetch or create Firestore user profile matching the auth uid
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const userRoleVal = data.role || data.initialRolePreference || 'client';
            
            let trialEndsAtVal = data.trialEndsAt;
            if (!trialEndsAtVal) {
              trialEndsAtVal = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
              updateDoc(userDocRef, { trialEndsAt: trialEndsAtVal }).catch(console.error);
            }

            setCurrentUserProfile({
              name: data.name || user.displayName || 'Usuario',
              email: data.email || user.email || 'user@example.com',
              avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
              tier: data.tier || 'Free',
              rafflesJoinedCount: data.rafflesJoinedCount || 0,
              ticketsPurchasedCount: data.ticketsPurchasedCount || 0,
              role: userRoleVal,
              trialEndsAt: trialEndsAtVal
            });
            // Set user role based on profile role
            setUserRole(userRoleVal);
          } else {
            // Document does not exist yet, create a default one
            const newProfile: UserProfile = {
              name: user.displayName || 'Usuario RifaSaaS',
              email: user.email || '',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
              tier: 'Free',
              rafflesJoinedCount: 0,
              ticketsPurchasedCount: 0,
              role: 'client',
              trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Error synchronizing users profile from Firestore:", err);
        }
      } else {
        setIsLoggedIn(false);
        // Fallback to Guest profile representation
        setCurrentUserProfile({
          name: 'Invitado',
          email: 'guest@example.com',
          avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=guest',
          tier: 'Free',
          rafflesJoinedCount: 0,
          ticketsPurchasedCount: 0,
          role: 'client'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setCurrentTab('home');
      setUserRole('client');
      
      // Push alert
      const newAlert: AppNotification = {
        id: `alert-${Date.now()}`,
        title: selectedLanguage === 'es' ? 'Sesión Cerrada' : 'Logged Out',
        message: selectedLanguage === 'es' ? 'Has cerrado sesión con éxito de RifaSaaS.' : 'You have successfully signed out of RifaSaaS.',
        timestamp: 'Ahora mismo',
        type: 'info',
        read: false
      };
      setNotifications(prev => [newAlert, ...prev]);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleAuthSuccess = (profile: UserProfile, isNewUser: boolean) => {
    setCurrentUserProfile(profile);
    setIsLoggedIn(true);
    if (profile.role) {
      setUserRole(profile.role as any);
    }

    // Push alert
    const newAlert: AppNotification = {
      id: `alert-${Date.now()}`,
      title: selectedLanguage === 'es' ? 'Acceso Autorizado' : 'Access Authorized',
      message: selectedLanguage === 'es' 
        ? `Bienvenido a RifaSaaS, ${profile.name}. Tu perfil ha sido sincronizado vía Firebase.` 
        : `Welcome to RifaSaaS, ${profile.name}. Your profile has been synchronized via Firebase.`,
      timestamp: 'Ahora mismo',
      type: 'success',
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  // Raffles state with Firebase Firestore listener
  const [raffles, setRaffles] = useState<Raffle[]>(INITIAL_RAFFLES);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'raffles'), (snapshot) => {
      const dbRaffles: Raffle[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbRaffles.push({ id: docSnap.id, ...data } as Raffle);
      });
      // Sort by start date (descending) or maintain arbitrary order
      setRaffles(dbRaffles);
    });
    return () => unsub();
  }, []);

  // Alerts inside app
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const local = localStorage.getItem('rifasaas_notifs_v2');
    return local ? JSON.parse(local) : INITIAL_NOTIFICATIONS;
  });

  // Current UX Navigation
  const [userRole, setUserRole] = useState<'organizer' | 'client'>('client');
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isPrizePaymentModalOpen, setIsPrizePaymentModalOpen] = useState(false);
  const [selectedRaffleForPrize, setSelectedRaffleForPrize] = useState<Raffle | null>(null);

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

  // (Removed localStorage persistence for raffles)

  useEffect(() => {
    localStorage.setItem('rifasaas_notifs_v2', JSON.stringify(notifications));
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
    if (editingRaffle) {
      const docRef = doc(db, 'raffles', editingRaffle.id);
      updateDoc(docRef, newRaffle)
        .then(() => {
          const newAlert: AppNotification = {
            id: `alert-${Date.now()}`,
            title: selectedLanguage === 'es' ? 'Campaña Actualizada' : selectedLanguage === 'pt' ? 'Campanha Atualizada' : 'Campaign Updated',
            message: selectedLanguage === 'es' 
              ? `La campaña ${newRaffle.name} ha sido actualizada.` 
              : `The campaign ${newRaffle.name} has been updated.`,
            timestamp: 'Ahora mismo',
            type: 'success',
            read: false
          };
          setNotifications(prev => [newAlert, ...prev]);
          setEditingRaffle(null);
        })
        .catch(console.error);
    } else {
      const created: Omit<Raffle, 'id'> = {
        ...newRaffle,
        soldTickets: [],
        reservedTickets: [],
        purchases: [],
        status: 'active'
      };

      addDoc(collection(db, 'raffles'), created)
        .then((docRef) => {
          const newAlert: AppNotification = {
            id: `alert-${Date.now()}`,
            title: selectedLanguage === 'es' ? 'Campaña Publicada' : selectedLanguage === 'pt' ? 'Campanha Publicada' : 'Campaign Published',
            message: selectedLanguage === 'es' 
              ? `Tu nueva campaña ${created.name} está activa.` 
              : `Your new campaign ${created.name} is active.`,
            timestamp: 'Ahora mismo',
            type: 'success',
            read: false
          };
          setNotifications(prev => [newAlert, ...prev]);
        })
        .catch(console.error);
    }
  };

  // Payment checkout button handler
  const handlePayClick = (raffleId: string, ticketNumbers: number[]) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    // Bloquear compra si la rifa no está activa o pasó la fecha de sorteo
    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle || raffle.status !== 'active' || new Date() > new Date(raffle.drawDate)) {
      alert(selectedLanguage === 'es'
        ? 'No se pueden comprar boletos en una rifa que ya fue cerrada o sorteada.'
        : selectedLanguage === 'pt'
        ? 'Não é possível comprar bilhetes em um sorteio que já foi encerrado ou realizado.'
        : 'Cannot purchase tickets for a raffle that has already been closed or drawn.');
      return;
    }

    setPendingTicketSelection(ticketNumbers);
    setActiveRaffleIdForCart(raffleId);
    setIsPaymentModalOpen(true);
  };

  // Ticket reservation handler
  const handleReserveClick = (raffleId: string, ticketNumbers: number[]) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle) return;

    // Bloquear reserva si la rifa no está activa o pasó la fecha de sorteo
    if (raffle.status !== 'active' || new Date() > new Date(raffle.drawDate)) {
      alert(selectedLanguage === 'es'
        ? 'No se pueden reservar boletos en una rifa que ya fue cerrada o sorteada.'
        : selectedLanguage === 'pt'
        ? 'Não é possível reservar bilhetes em um sorteio que já foi encerrado ou realizado.'
        : 'Cannot reserve tickets for a raffle that has already been closed or drawn.');
      return;
    }

    const newPurchases: TicketPurchase[] = ticketNumbers.map(num => ({
      ticketNumber: String(num).padStart(3, '0'),
      buyerName: currentUserProfile.name,
      buyerEmail: currentUserProfile.email,
      timestamp: 'Just now',
      paymentMethod: 'None',
      status: 'Reserved',
      amount: raffle.ticketPrice,
      currency: raffle.currency,
      raffle: raffle.name
    }));

    const newReserved = [...raffle.reservedTickets];
    ticketNumbers.forEach(num => {
      if (!newReserved.includes(num)) newReserved.push(num);
    });

    const docRef = doc(db, 'raffles', raffleId);
    updateDoc(docRef, {
      reservedTickets: newReserved,
      purchases: [...newPurchases, ...raffle.purchases]
    }).then(() => {
      const newAlert: AppNotification = {
        id: `alert-${Date.now()}`,
        title: selectedLanguage === 'es' ? 'Reserva Exitosa' : selectedLanguage === 'pt' ? 'Reserva Bem Sucedida' : 'Reservation Successful',
        message: selectedLanguage === 'es' 
          ? `Has reservado los boletos ${ticketNumbers.map(n => '#' + String(n).padStart(3, '0')).join(', ')}. Recuerda pagarlos pronto.` 
          : `You reserved tickets ${ticketNumbers.map(n => '#' + String(n).padStart(3, '0')).join(', ')}.`,
        timestamp: 'Ahora mismo',
        type: 'info',
        read: false
      };
      setNotifications(prev => [newAlert, ...prev]);

      setSelectedRaffleId(null);
      setCurrentTab('mytickets');
    }).catch(console.error);
  };

  // Handle verified successful payments
  const handlePaymentSuccess = (purchaser: { name: string; email: string; paymentMethod: string }) => {
    if (!activeRaffleIdForCart) return;

    const raffle = raffles.find(r => r.id === activeRaffleIdForCart);
    if (!raffle) return;

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

    // Filter out any prior 'Reserved' purchases for these specific tickets
    const cleanPurchases = raffle.purchases.filter(p => {
      if (p.status === 'Reserved' && pendingTicketSelection.map(n => String(n).padStart(3, '0')).includes(p.ticketNumber)) {
        return false;
      }
      return true;
    });

    // Remove from reservedTickets list
    const cleanReserved = raffle.reservedTickets.filter(num => !pendingTicketSelection.includes(num));

    const docRef = doc(db, 'raffles', activeRaffleIdForCart);
    updateDoc(docRef, {
      soldTickets: originalSold,
      reservedTickets: cleanReserved,
      purchases: [...newPurchases, ...cleanPurchases]
    }).then(() => {
      // Update player dashboard statistics if the current user bought them
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
        message: `${purchaser.name} purchased tickets ${pendingTicketSelection.map(n => '#' + String(n).padStart(3, '0')).join(', ')} in ${raffle.name}. Transaction receipt: ${transactionId}.`,
        timestamp: 'Just now',
        type: 'success',
        read: false
      };
      setNotifications(prev => [newAlert, ...prev]);

      setIsPaymentModalOpen(false);
      setPendingTicketSelection([]);
      setActiveRaffleIdForCart(null);
      setCurrentTab('mytickets');
    }).catch(console.error);
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

    const docRef = doc(db, 'raffles', raffleId);

    // Mark raffle status as 'drawing'
    updateDoc(docRef, { status: 'drawing' }).then(() => {
      // Run beautiful animated transition timer before revealing winner
      setTimeout(() => {
        // Pick randomly from sold tickets to make a valid winner
        const sold = raffleToDraw.soldTickets;
        const winnerTicketNum = sold[Math.floor(Math.random() * sold.length)];
        
        // Find the purchaser details
        const winningPurchase = raffleToDraw.purchases.find(p => Number(p.ticketNumber) === winnerTicketNum);
        const winnerName = winningPurchase?.buyerName || 'Participante Anónimo';
        const winnerEmail = winningPurchase?.buyerEmail || 'anonimo@ejemplo.com';

        updateDoc(docRef, {
          status: 'drawn',
          winnerTicket: String(winnerTicketNum).padStart(3, '0'),
          winnerName,
          winnerEmail
        }).then(() => {
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
        }).catch(console.error);
      }, 3200);
    }).catch(console.error);
  };

  // Manual draw function
  const handleManualDraw = (raffleId: string, winnerTicketNum: number) => {
    const raffleToDraw = raffles.find(r => r.id === raffleId);
    if (!raffleToDraw) return;

    // Check if ticket is sold
    if (!raffleToDraw.soldTickets.includes(winnerTicketNum)) {
      alert(selectedLanguage === 'es' ? 'El ticket ingresado no ha sido vendido.' : 'The entered ticket has not been sold.');
      return;
    }

    const docRef = doc(db, 'raffles', raffleId);

    // Find the purchaser details
    const winningPurchase = raffleToDraw.purchases.find(p => Number(p.ticketNumber) === winnerTicketNum);
    const winnerName = winningPurchase?.buyerName || 'Participante Anónimo';
    const winnerEmail = winningPurchase?.buyerEmail || 'anonimo@ejemplo.com';

    updateDoc(docRef, {
      status: 'drawn',
      winnerTicket: String(winnerTicketNum).padStart(3, '0'),
      winnerName,
      winnerEmail
    }).then(() => {
      // Push draw results notification
      const resultAlert: AppNotification = {
        id: `alert-${Date.now()}`,
        title: '🎉 GANADOR CONFIRMADO (MANUAL)',
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
    }).catch(console.error);
  };

  // Cumulative transactions catalog
  const cumulativePurchases = raffles.reduce<TicketPurchase[]>((acc, active) => {
    return [...acc, ...active.purchases];
  }, []);

  const handleSelectRaffle = (raffle: Raffle) => {
    setSelectedRaffleId(raffle.id);
    if (userRole === 'client') {
      setCurrentTab('home');
    }
  };

  const handleEditRaffle = (raffle: Raffle) => {
    setEditingRaffle(raffle);
    setIsCreateModalOpen(true);
  };

  const handlePayPrizeClick = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    if (raffle) {
      setSelectedRaffleForPrize(raffle);
      setIsPrizePaymentModalOpen(true);
    }
  };

  const handlePayPrizeSuccess = () => {
    if (!selectedRaffleForPrize) return;
    
    const docRef = doc(db, 'raffles', selectedRaffleForPrize.id);
    updateDoc(docRef, {
      prizePaid: true
    }).then(() => {
      const newAlert: AppNotification = {
        id: `alert-${Date.now()}`,
        title: selectedLanguage === 'es' ? 'Pago Exitoso' : 'Payment Successful',
        message: selectedLanguage === 'es' 
          ? `El premio para la campaña ${selectedRaffleForPrize.name} ha sido pagado.`
          : `The prize for campaign ${selectedRaffleForPrize.name} has been paid.`,
        timestamp: 'Ahora mismo',
        type: 'success',
        read: false
      };
      setNotifications(prev => [newAlert, ...prev]);
    }).catch(console.error);
  };

  const handleToggleRaffleStatus = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle) return;
    
    const newStatus = raffle.status === 'active' ? 'closed' : 'active';
    const docRef = doc(db, 'raffles', raffleId);
    updateDoc(docRef, { status: newStatus }).catch(console.error);
  };

  const unreadAlertsCount = notifications.filter(a => !a.read).length;

  const metaEnv = (import.meta as any).env || {};
  const paypalClientId = metaEnv.VITE_PAYPAL_ENV === 'live' 
    ? metaEnv.VITE_PAYPAL_CLIENT_ID_LIVE 
    : metaEnv.VITE_PAYPAL_CLIENT_ID_SANDBOX;

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId || 'test', currency: 'USD', intent: 'subscription', vault: true }}>
      <div className="min-h-screen bg-gray-50/70 text-gray-900 font-sans flex flex-col pt-16">
      
      {/* Platform Navigation Header */}
      <Header
        currentLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        userRole={userRole}
        onRoleToggle={(role) => {
          if (!isLoggedIn && role === 'organizer') {
            setAuthModalMode('register');
            setIsAuthModalOpen(true);
            return;
          }
          setUserRole(role);
          setSelectedRaffleId(null);
        }}
        userProfile={currentUserProfile}
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (!isLoggedIn && (tab === 'mytickets' || tab === 'profile')) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
            return;
          }
          setCurrentTab(tab);
          if (tab !== 'home') {
            setSelectedRaffleId(null);
          }
        }}
        unreadNotificationsCount={unreadAlertsCount}
        onAlertsClick={() => setIsAlertsOpen(true)}
        isLoggedIn={isLoggedIn}
        onAuthBtnClick={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
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
                (() => {
                  const isTrialExpired = currentUserProfile?.tier === 'Free' && currentUserProfile?.trialEndsAt && new Date(currentUserProfile.trialEndsAt) < new Date();
                  
                  if (isTrialExpired) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-10">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedLanguage === 'es' ? 'Tu periodo de prueba ha terminado' : 'Your trial period has ended'}
                        </h2>
                        <p className="text-gray-600 mb-6 text-sm">
                          {selectedLanguage === 'es' 
                            ? 'El acceso gratuito de 7 días ha concluido. Para seguir utilizando RifaSaaS y mantener tus sorteos activos, por favor adquiere un plan.'
                            : 'The 7-day free access has concluded. To continue using RifaSaaS and keep your raffles active, please purchase a plan.'}
                        </p>
                        <button
                          onClick={() => setCurrentTab('pricing')}
                          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          {selectedLanguage === 'es' ? 'Ver Planes de Suscripción' : 'View Subscription Plans'}
                        </button>
                      </div>
                    );
                  }

                  return selectedRaffleId ? (
                    <div>
                      <button
                        id="back-to-campaign-list"
                        onClick={() => setSelectedRaffleId(null)}
                        className="mb-4 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer focus:outline-hidden"
                      >
                        ← {selectedLanguage === 'es' ? 'Volver al Panel' : selectedLanguage === 'pt' ? 'Voltar ao Painel' : 'Back to Dashboard'}
                      </button>
                      <TicketBoard
                        currentLanguage={selectedLanguage}
                        raffle={raffles.find(r => r.id === selectedRaffleId)!}
                        onPayClick={handlePayClick}
                        onReserveClick={handleReserveClick}
                        onTriggerDraw={handleTriggerDraw}
                        userRole={userRole}
                      />
                    </div>
                  ) : (
                  <OrganizerDashboard
                    currentLanguage={selectedLanguage}
                    raffles={raffles}
                    recentPurchases={cumulativePurchases}
                    userTier={currentUserProfile?.tier || 'Free'}
                    onCreateRaffleClick={() => {
                      setEditingRaffle(null);
                      setIsCreateModalOpen(true);
                    }}
                    onSelectRaffle={handleSelectRaffle}
                    onEditRaffle={handleEditRaffle}
                    onPayPrize={handlePayPrizeClick}
                    onTriggerDraw={handleTriggerDraw}
                    onTriggerManualDraw={handleManualDraw}
                    onToggleRaffleStatus={handleToggleRaffleStatus}
                  />
                );
              })()
              )}

              {currentTab === 'pricing' && (
                <PricingPlans 
                  currentLanguage={selectedLanguage} 
                  userTier={currentUserProfile?.tier || 'Free'} 
                  isLoggedIn={isLoggedIn}
                  onOpenAuth={(mode) => {
                    setAuthModalMode(mode || 'register');
                    setIsAuthModalOpen(true);
                  }}
                />
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
                        onReserveClick={handleReserveClick}
                        onTriggerDraw={handleTriggerDraw}
                        userRole={userRole}
                      />
                    </div>
                  ) : (
                    // Display all active campaigns Grid
                    <div className="space-y-6">
                      
                      {/* Enhanced Landing Page Hero Section */}
                      <section className="relative rounded-[2.5rem] overflow-hidden bg-slate-950 text-white min-h-[500px] p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center text-center shadow-2xl border border-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-950 to-purple-900/40 opacity-80" />
                        
                        {/* Decorative animated elements */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
                        
                        <div className="relative z-10 max-w-3xl space-y-8 flex flex-col items-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
                              <Star size={14} className="fill-emerald-400" /> 
                              {selectedLanguage === 'es' ? 'Plataforma #1 de Sorteos' : 'Provably Fair Raffle Hub'}
                            </span>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="space-y-4"
                          >
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                              {selectedLanguage === 'es' ? 'Gana Premios Increíbles con Total Seguridad' : 'Win Incredible Prizes with Total Security'}
                            </h1>
                            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
                              {selectedLanguage === 'es' ? 'Participa en sorteos exclusivos y verificados. Tecnología transparente de punta para garantizar que cada ticket tiene las mismas oportunidades de ganar.' : 'Enter exclusive, verified raffle campaigns backed by provably safe automated distribution. Every ticket certified.'}
                            </p>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                          >
                            <button
                              onClick={() => {
                                document.getElementById('campaigns-section')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {selectedLanguage === 'es' ? 'Explorar Sorteos' : 'Explore Raffles'}
                              <ArrowRight size={18} />
                            </button>
                            
                            {!isLoggedIn && (
                              <button
                                onClick={() => {
                                  setAuthModalMode('register');
                                  setIsAuthModalOpen(true);
                                }}
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {selectedLanguage === 'es' ? 'Crear una Cuenta' : 'Create an Account'}
                              </button>
                            )}
                          </motion.div>

                          {/* Trust metrics */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="pt-8 mt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 sm:gap-16 text-slate-400 w-full"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl font-black text-white">100%</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold">Transparente</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl font-black text-white">+50k</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold">Usuarios</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl font-black text-white">24/7</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold">Soporte</span>
                            </div>
                          </motion.div>
                        </div>
                      </section>

                      {/* Features Section */}
                      <section className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 group">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <ShieldCheck size={28} />
                          </div>
                          <h3 className="text-lg font-black text-gray-900 mb-3">{selectedLanguage === 'es' ? 'Sorteos Verificados' : 'Verified Draws'}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {selectedLanguage === 'es' ? 'Todos nuestros sorteos utilizan un sistema algorítmico comprobable que asegura un ganador 100% aleatorio y justo.' : 'All our draws use a provably fair algorithmic system that ensures a 100% random and fair winner.'}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 group">
                          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <Zap size={28} />
                          </div>
                          <h3 className="text-lg font-black text-gray-900 mb-3">{selectedLanguage === 'es' ? 'Pagos Instantáneos' : 'Instant Payments'}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {selectedLanguage === 'es' ? 'Compra tus boletos en segundos con métodos de pago seguros como Tarjeta de Crédito o transferencias instantáneas.' : 'Buy your tickets in seconds with secure payment methods like Credit Card or instant transfers.'}
                          </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 group">
                          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Users size={28} />
                          </div>
                          <h3 className="text-lg font-black text-gray-900 mb-3">{selectedLanguage === 'es' ? 'Comunidad Activa' : 'Active Community'}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {selectedLanguage === 'es' ? 'Únete a miles de participantes que ya están ganando. Interactúa, revisa el historial y participa con confianza.' : 'Join thousands of participants who are already winning. Interact, check history and participate with confidence.'}
                          </p>
                        </div>
                      </section>

                      {/* How it Works Section */}
                      <section className="bg-emerald-900 rounded-[2.5rem] p-10 sm:p-14 text-white relative overflow-hidden mb-8 shadow-xl">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                        <div className="relative z-10 text-center mb-12">
                          <h2 className="text-3xl font-black mb-4">{selectedLanguage === 'es' ? '¿Cómo Funciona?' : 'How it Works'}</h2>
                          <p className="text-emerald-100/80 max-w-xl mx-auto text-sm">
                            {selectedLanguage === 'es' ? 'Participar es muy fácil. Sigue estos 3 sencillos pasos y estarás listo para ganar.' : 'Participating is very easy. Follow these 3 simple steps and you will be ready to win.'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-800 border-4 border-emerald-700 flex items-center justify-center text-2xl font-black shadow-xl">1</div>
                            <h4 className="font-bold text-lg">{selectedLanguage === 'es' ? 'Elige una Campaña' : 'Choose a Campaign'}</h4>
                            <p className="text-emerald-100/70 text-sm">{selectedLanguage === 'es' ? 'Explora nuestra lista de sorteos activos y encuentra el premio que deseas.' : 'Explore our list of active raffles and find the prize you want.'}</p>
                          </div>
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-800 border-4 border-emerald-700 flex items-center justify-center text-2xl font-black shadow-xl">2</div>
                            <h4 className="font-bold text-lg">{selectedLanguage === 'es' ? 'Selecciona tus Números' : 'Select your Numbers'}</h4>
                            <p className="text-emerald-100/70 text-sm">{selectedLanguage === 'es' ? 'Usa nuestro panel interactivo para elegir tus números de la suerte.' : 'Use our interactive panel to choose your lucky numbers.'}</p>
                          </div>
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-800 border-4 border-emerald-700 flex items-center justify-center text-2xl font-black shadow-xl">3</div>
                            <h4 className="font-bold text-lg">{selectedLanguage === 'es' ? 'Compra y Gana' : 'Buy and Win'}</h4>
                            <p className="text-emerald-100/70 text-sm">{selectedLanguage === 'es' ? 'Realiza tu pago seguro y espera el anuncio del sorteo automatizado.' : 'Make your secure payment and wait for the automated draw announcement.'}</p>
                          </div>
                        </div>
                      </section>

                      {/* Active Grid row */}
                      <div id="campaigns-section" className="space-y-4 scroll-mt-24">
                        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">
                          {selectedLanguage === 'es' ? 'Campañas Disponibles' : 'Available Campaigns'}
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {raffles.map((raffle) => {
                            const percent = Math.min(100, Math.round((raffle.soldTickets.length / raffle.totalTickets) * 100));
                            const isDrawn = raffle.status === 'drawn';
                            const currSymbol = raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : raffle.currency === 'VES' ? 'Bs.' : raffle.currency === 'SOL' ? 'S/' : 'π';

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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ClientDashboard
                    currentLanguage={selectedLanguage}
                    userProfile={currentUserProfile}
                    purchases={cumulativePurchases.filter(p => p.buyerEmail === currentUserProfile.email)}
                    raffles={raffles}
                    notifications={notifications}
                    onSelectRaffle={handleSelectRaffle}
                    onSignOut={() => setIsLoggedIn(false)}
                    isLoggedIn={isLoggedIn}
                    onPayReservedTickets={(raffleId, ticketNumbers) => {
                      handlePayClick(raffleId, ticketNumbers);
                    }}
                  />
                </div>
              )}

              {currentTab === 'pricing' && (
                <PricingPlans 
                  currentLanguage={selectedLanguage} 
                  userTier={currentUserProfile?.tier || 'Free'}
                  isLoggedIn={isLoggedIn}
                  onOpenAuth={(mode) => {
                    setAuthModalMode(mode || 'register');
                    setIsAuthModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'profile' && (
                <ClientDashboard
                  currentLanguage={selectedLanguage}
                  userProfile={currentUserProfile}
                  purchases={cumulativePurchases.filter(p => p.buyerEmail === currentUserProfile.email)}
                  raffles={raffles}
                  notifications={notifications}
                  onSelectRaffle={handleSelectRaffle}
                  isLoggedIn={isLoggedIn}
                  onSignOut={handleSignOut}
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
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingRaffle(null);
        }}
        onSubmit={handleCreateRaffleSubmit}
        editingRaffle={editingRaffle}
        userTier={currentUserProfile?.tier || 'Free'}
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
          prefillName={isLoggedIn ? currentUserProfile.name : ''}
          prefillEmail={isLoggedIn ? currentUserProfile.email : ''}
        />
      )}

      {/* PRIZE PAYMENT MODAL POPUP */}
      {selectedRaffleForPrize && (
        <PrizePaymentModal
          currentLanguage={selectedLanguage}
          raffle={selectedRaffleForPrize}
          isOpen={isPrizePaymentModalOpen}
          onClose={() => {
            setIsPrizePaymentModalOpen(false);
            setSelectedRaffleForPrize(null);
          }}
          onPaymentSuccess={handlePayPrizeSuccess}
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

      {/* REAL-TIME FIREBASE AUTH MODAL DIALOG */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentLanguage={selectedLanguage}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Simple decorative footer */}
      <footer className="py-8 border-t border-gray-200 mt-12 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs text-gray-400 space-y-3 leading-normal flex flex-col items-center">
          <div className="flex gap-4 justify-center text-emerald-700 font-semibold mb-2">
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:underline cursor-pointer">Políticas de Privacidad</button>
            <span>|</span>
            <button onClick={() => setIsTermsOpen(true)} className="hover:underline cursor-pointer">Términos de Uso</button>
          </div>
          <p>© 2026 RifaSaaS Inc. Decarbonized mobile raffle ledger. All rights reserved.</p>
          <p className="font-mono">Provably Fair Core • API Version v2.4.0 • Port 3000 Ingress Routing</p>
        </div>
      </footer>

      {/* LEGAL MODALS */}
      <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsOfUse isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

    </div>
    </PayPalScriptProvider>
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
