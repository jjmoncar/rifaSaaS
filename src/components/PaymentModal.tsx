import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, Raffle } from '../types';
import { X, CreditCard, Send, Lock, CheckCircle, Wifi, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  currentLanguage: Language;
  raffle: Raffle;
  ticketNumbers: number[];
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (purchaserData: { name: string; email: string; paymentMethod: string }) => void;
  prefillName?: string;
  prefillEmail?: string;
}

export default function PaymentModal({
  currentLanguage,
  raffle,
  ticketNumbers,
  isOpen,
  onClose,
  onPaymentSuccess,
  prefillName = '',
  prefillEmail = ''
}: PaymentModalProps) {
  const t = translations[currentLanguage];

  // States
  const [buyerName, setBuyerName] = useState(prefillName);
  const [buyerEmail, setBuyerEmail] = useState(prefillEmail);
  const [paymentMethod, setPaymentMethod] = useState(() => {
    if (raffle.currency === 'Pi') return 'Pi Net Wallet';
    if (raffle.currency === 'BRL') return 'Pix (Brazilian Instant)';
    return 'Credit Card (Simulated)';
  });
  
  // Credit card details or key values
  const [cardKey, setCardKey] = useState('');
  
  // Phase handling
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !cardKey) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setStatus('processing');

    // Simulate ledger validation
    setTimeout(() => {
      setStatus('completed');
    }, 1500);
  };

  const handleCompletedClose = () => {
    onPaymentSuccess({
      name: buyerName,
      email: buyerEmail,
      paymentMethod
    });
    onClose();
  };

  const currencySymbol = raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : 'π';
  const totalAmountPrice = (ticketNumbers.length * raffle.ticketPrice).toLocaleString('en-US', {
    minimumFractionDigits: raffle.currency === 'Pi' ? 0 : 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto flex items-center justify-center p-4">
      
      {/* Backdrop overlay */}
      <div 
        id="payment-backdrop"
        onClick={status === 'completed' ? handleCompletedClose : onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl z-10 border border-gray-100"
      >
        
        {/* Inner header bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
              <Lock size={16} />
            </span>
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest leading-none">
              {t.paymentSecureGateway}
            </h2>
          </div>
          {status !== 'processing' && (
            <button
              id="payment-cancel-btn"
              onClick={status === 'completed' ? handleCompletedClose : onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Phase switcher layout */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/30 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tickets seleccionados</p>
                    <p className="text-sm font-bold text-gray-800 tracking-tight mt-0.5">
                      {ticketNumbers.map(n => '#' + n.toString().padStart(3, '0')).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Monto a pagar</p>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">
                      {currencySymbol}{totalAmountPrice}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.simulateReceipt}
                </p>

                {showError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-[11px] flex gap-2">
                    <AlertCircle className="shrink-0 text-red-600 mt-0.5" size={14} />
                    <span>Favor completa todos los campos del comprador para simular la verificación segura.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.buyerNameLabel}</label>
                    <input
                      id="buyer-input-name"
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.buyerEmailLabel}</label>
                    <input
                      id="buyer-input-email"
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-sans"
                    />
                  </div>

                  {/* Simulated Method picker depending on campaign currency */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.paymentMethodLabel}</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs text-gray-800">
                      <div className="flex items-center gap-2">
                        <CreditCard size={15} className="text-emerald-700" />
                        <span className="font-semibold">{paymentMethod}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">ACTIVO</span>
                    </div>
                  </div>

                  {/* Credit card digits, wallet keys or Pix key mock input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {raffle.currency === 'Pi' ? 'Wallet Private Key / ID' : raffle.currency === 'BRL' ? 'Pix Alias ID' : t.cardNumberLabel}
                    </label>
                    <input
                      id="buyer-input-cardkey"
                      type="text"
                      required
                      value={cardKey}
                      onChange={(e) => setCardKey(e.target.value)}
                      placeholder={raffle.currency === 'Pi' ? 'G2B...G39' : raffle.currency === 'BRL' ? 'alex@ex.com.br' : '4111 2222 3333 4444'}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <button
                    id="submit-payment-btn"
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/10 active:scale-97 transition-all cursor-pointer uppercase tracking-widest"
                  >
                    <span>{t.payNow}: {currencySymbol}{totalAmountPrice}</span>
                  </button>

                </form>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                {/* Visual loading wheel */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-50 border-t-emerald-700 animate-spin" />
                  <Lock className="text-emerald-700" size={20} />
                </div>
                
                <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-widest pt-2">
                  {t.processingPayment}
                </h3>
                <p className="text-xs text-gray-400">Verificando firmas provably fair...</p>
                
                {/* Network indicator simulation */}
                <div className="text-[10px] text-gray-500 flex items-center gap-1.5 pt-4 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100">
                  <Wifi className="text-emerald-700" size={12} />
                  <span className="font-bold tracking-wider">LEDGER CONNECTED (102ms SLA)</span>
                </div>
              </motion.div>
            )}

            {status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 flex flex-col items-center justify-center text-center space-y-5"
              >
                {/* Huge animated check badge */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-lg border border-emerald-100 scale-102">
                  <CheckCircle size={32} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="font-black text-lg text-emerald-805 uppercase tracking-wide">
                    {t.paymentCompleted}
                  </h3>
                  <p className="text-xs font-medium text-gray-600 max-w-xs leading-relaxed">
                    {t.ticketConfirmation.replace('{numbers}', ticketNumbers.map(n => '#' + n.toString().padStart(3, '0')).join(', '))}
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/50 w-full text-left font-mono space-y-1 text-[10px] text-gray-400 leading-normal">
                  <p className="font-bold text-gray-600">LEDGER STATE TRACE:</p>
                  <p>Transaction: <span className="text-gray-700 font-bold">TX_RIFASAAS_89A2</span></p>
                  <p>Signature: <span className="text-gray-700 font-bold">provable-fair-hash-sha256-cert</span></p>
                </div>

                <p className="text-[10px] text-gray-400">
                  {t.drawConfirmation}
                </p>

                <button
                  id="payment-success-close-btn"
                  onClick={handleCompletedClose}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-700/10 cursor-pointer"
                >
                  <span>{t.close}</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
