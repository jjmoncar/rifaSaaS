import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, Raffle } from '../types';
import { X, DollarSign, Send, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrizePaymentModalProps {
  currentLanguage: Language;
  raffle: Raffle;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export default function PrizePaymentModal({
  currentLanguage,
  raffle,
  isOpen,
  onClose,
  onPaymentSuccess
}: PrizePaymentModalProps) {
  const t = translations[currentLanguage];

  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  if (!isOpen) return null;

  const totalRevenue = raffle.purchases
    .filter(p => p.status === 'Successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const currencySymbol = raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : 'π';
  const formattedRevenue = totalRevenue.toLocaleString('en-US', {
    minimumFractionDigits: raffle.currency === 'Pi' ? 0 : 2,
    maximumFractionDigits: 2
  });

  const handlePayPrize = () => {
    setStatus('processing');
    // Simulate transaction
    setTimeout(() => {
      setStatus('completed');
    }, 2000);
  };

  const handleCompletedClose = () => {
    onPaymentSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto flex items-center justify-center p-4">
      <div 
        onClick={status === 'completed' ? handleCompletedClose : onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl z-10 border border-gray-100"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <ShieldCheck size={16} />
            </span>
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest leading-none">
              Pago de Premio (Simulación)
            </h2>
          </div>
          {status !== 'processing' && (
            <button
              onClick={status === 'completed' ? handleCompletedClose : onClose}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">{raffle.name}</h3>
                  <p className="text-sm text-gray-500">Revisa los datos antes de procesar el pago al ganador.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ganador</span>
                    <span className="text-sm font-bold text-gray-800">{raffle.winnerName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ticket</span>
                    <span className="text-sm font-bold text-amber-600">#{raffle.winnerTicket}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monto Recaudado</span>
                    <span className="text-lg font-black text-emerald-700">{currencySymbol}{formattedRevenue}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-blue-800 text-xs">
                  <AlertCircle className="shrink-0 text-blue-600 mt-0.5" size={16} />
                  <span>Esta es una transacción de prueba. Al confirmar, la campaña se marcará como pagada.</span>
                </div>

                <button
                  onClick={handlePayPrize}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={18} />
                  Procesar Pago al Ganador
                </button>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <DollarSign className="absolute inset-0 m-auto text-blue-600" size={24} />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-gray-900">Enviando fondos...</p>
                  <p className="text-xs text-gray-500">Contactando red bancaria/blockchain</p>
                </div>
              </motion.div>
            )}

            {status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center text-center space-y-5"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">¡Pago Exitoso!</h3>
                  <p className="text-sm text-gray-500">
                    Se han transferido los fondos a <span className="font-bold text-gray-700">{raffle.winnerName}</span>.
                  </p>
                </div>
                <button
                  onClick={handleCompletedClose}
                  className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Continuar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
