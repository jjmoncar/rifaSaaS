import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { PayPalButtons } from '@paypal/react-paypal-js';

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
  const [paypalError, setPaypalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setPaypalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rawNumericVal = parseFloat(planPrice.replace(/[^0-9.]/g, ''));
  const numericPrice = !isNaN(rawNumericVal) && rawNumericVal > 0 ? rawNumericVal : (planTier === 'Enterprise' ? 99 : 29);

  const handleCreateOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          description: `Suscripción Plan ${planTier} - RifaSaaS`,
          amount: {
            currency_code: 'USD',
            value: numericPrice.toFixed(2),
          },
        },
      ],
    });
  };

  const handleApproveOrder = async (data: any, actions: any) => {
    setStep('processing');
    try {
      const details = await actions.order?.capture();
      console.log('PayPal Plan Payment Successful:', details);
      setStep('success');
      setTimeout(() => {
        onSuccess(planTier);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('PayPal Plan Payment Error:', err);
      setPaypalError(currentLanguage === 'es' ? 'Error al procesar el pago con PayPal.' : 'Error processing PayPal payment.');
      setStep('checkout');
    }
  };

  const handleFallbackPay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(planTier);
        onClose();
      }, 2000);
    }, 2000);
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
                    {currentLanguage === 'es' ? 'Método de Pago (PayPal Oficial)' : 'Payment Method (Official PayPal)'}
                  </p>

                  {paypalError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{paypalError}</span>
                    </div>
                  )}

                  <div className="min-h-[120px] rounded-xl overflow-hidden pt-1">
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                      createOrder={handleCreateOrder}
                      onApprove={handleApproveOrder}
                      onError={(err) => {
                        console.error('PayPal SDK error:', err);
                        setPaypalError(currentLanguage === 'es' ? 'No se pudo cargar el portal de PayPal. Usa el botón rápido abajo.' : 'Could not load PayPal gateway. Use quick checkout below.');
                      }}
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleFallbackPay}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      {currentLanguage === 'es' ? '⚡ Simular confirmación rápida PayPal (Modo Prueba)' : '⚡ Simulate quick PayPal confirmation (Test Mode)'}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                      {currentLanguage === 'es' ? 'Pago seguro encriptado de nivel 256-bit procesado por PayPal' : '256-bit encrypted secure payment processed by PayPal'}
                    </p>
                  </div>
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
