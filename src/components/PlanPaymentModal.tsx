import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface PlanPaymentModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  planTier: 'Medium' | 'Pro' | 'Enterprise';
  planPrice: string;
  onSuccess: (tier: 'Medium' | 'Pro' | 'Enterprise') => void;
}

export default function PlanPaymentModal({
  currentLanguage,
  isOpen,
  onClose,
  planTier,
  planPrice,
  onSuccess
}: PlanPaymentModalProps) {
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(planTier);
        onClose();
      }, 2000);
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 'checkout' ? onClose : undefined}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          {step === 'checkout' && (
            <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} />
                {currentLanguage === 'es' ? 'Pago Seguro' : currentLanguage === 'pt' ? 'Pagamento Seguro' : 'Secure Checkout'}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-6">
            {step === 'checkout' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                      {currentLanguage === 'es' ? 'Plan Seleccionado' : 'Selected Plan'}
                    </p>
                    <p className="text-xl font-extrabold text-blue-900 mt-1">{planTier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{planPrice}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {currentLanguage === 'es' ? 'Método de Pago' : 'Payment Method'}
                  </p>
                  <button
                    onClick={handlePay}
                    className="w-full bg-[#FFC439] hover:bg-[#F4BB33] text-[#003087] font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 124 33" className="h-6">
                      <path fill="#003087" d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265c.49 0 .906-.35.986-.835l.89-5.632h3.585c4.366 0 7.314-2.14 8.013-6.577.34-2.164-.136-4.004-1.393-5.267-1.31-1.315-3.411-1.89-6.326-1.89h.96z"/>
                      <path fill="#009CDE" d="M115.424 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265c.49 0 .906-.35.986-.835l.89-5.632h3.585c4.366 0 7.314-2.14 8.013-6.577.34-2.164-.136-4.004-1.393-5.267-1.31-1.315-3.411-1.89-6.326-1.89h.96z"/>
                      <path fill="#012169" d="M34.802 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265c.49 0 .906-.35.986-.835l1.656-10.493h2.819c4.366 0 7.314-2.14 8.013-6.577.34-2.164-.136-4.004-1.393-5.267-1.31-1.315-3.411-1.89-6.326-1.89h.96z"/>
                      <path fill="#009CDE" d="M85.424 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265c.49 0 .906-.35.986-.835l1.656-10.493h2.819c4.366 0 7.314-2.14 8.013-6.577.34-2.164-.136-4.004-1.393-5.267-1.31-1.315-3.411-1.89-6.326-1.89h.96z"/>
                    </svg>
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-2">
                    {currentLanguage === 'es' ? 'Pago seguro procesado por PayPal' : 'Secure payment processed by PayPal'}
                  </p>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {currentLanguage === 'es' ? 'Procesando Pago' : 'Processing Payment'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentLanguage === 'es' ? 'Conectando de forma segura con PayPal...' : 'Connecting securely with PayPal...'}
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle className="w-20 h-20 text-emerald-500" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {currentLanguage === 'es' ? '¡Pago Exitoso!' : 'Payment Successful!'}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm">
                    {currentLanguage === 'es' ? `Tu plan ha sido actualizado a ${planTier}.` : `Your plan has been upgraded to ${planTier}.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
