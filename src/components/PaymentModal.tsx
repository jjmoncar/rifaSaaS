import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, Raffle } from '../types';
import { X, Lock, CheckCircle, Wifi, AlertCircle, Copy, Check, QrCode } from 'lucide-react';
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
  prefillName = 'julio caraballo',
  prefillEmail = 'jjmc081970@gmail.com'
}: PaymentModalProps) {
  const t = translations[currentLanguage];

  // Form State
  const [buyerName, setBuyerName] = useState(prefillName);
  const [buyerEmail, setBuyerEmail] = useState(prefillEmail);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'paypal'>(
    raffle.currency === 'BRL' ? 'pix' : 'pix'
  );
  
  // Pix Alias / Key or PayPal account key
  const [pixAliasId, setPixAliasId] = useState('alex@ex.com.br');
  const [paypalAccount, setPaypalAccount] = useState(prefillEmail || 'jjmc081970@gmail.com');
  const [copiedPix, setCopiedPix] = useState(false);
  
  // Phase handling
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [showError, setShowError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currencySymbol = raffle.currency === 'USD' ? '$' : raffle.currency === 'BRL' ? 'R$' : raffle.currency === 'VES' ? 'Bs.' : raffle.currency === 'SOL' ? 'S/' : 'π';
  const rawTotalPrice = ticketNumbers.length * raffle.ticketPrice;
  const totalAmountPrice = rawTotalPrice.toLocaleString('en-US', {
    minimumFractionDigits: raffle.currency === 'Pi' ? 0 : 2,
    maximumFractionDigits: 2
  });

  const pixCopyPasteCode = `00020126580014BR.GOV.BCB.PIX0136${pixAliasId}5204000053039865405${rawTotalPrice.toFixed(2)}5802BR5913RIFASAAS_SOCI6009SAO_PAULO62070503***6304E2CA`;

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const trimmedName = buyerName.trim();
    const trimmedEmail = buyerEmail.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName || !trimmedEmail) {
      setShowError(true);
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setValidationError(currentLanguage === 'es' ? 'El formato del correo es inválido.' : currentLanguage === 'pt' ? 'O formato do e-mail é inválido.' : 'Invalid email format.');
      return;
    }

    setShowError(false);
    setStatus('processing');

    // Simulate backend verification
    setTimeout(() => {
      setStatus('completed');
    }, 1800);
  };

  const handleCompletedClose = () => {
    onPaymentSuccess({
      name: buyerName,
      email: buyerEmail,
      paymentMethod: paymentMethod === 'pix' ? 'Pix (Brazilian Instant)' : 'PayPal'
    });
    onClose();
  };

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
        
        {/* Inner header bar matching screenshot design */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Lock size={16} strokeWidth={2.5} />
            </span>
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest leading-none font-sans">
              PORTAL DE PAGAMENTO SEGURO
            </h2>
          </div>
          {status !== 'processing' && (
            <button
              id="payment-cancel-btn"
              onClick={status === 'completed' ? handleCompletedClose : onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Content */}
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
                {/* HUD Summary Box matching screenshot */}
                <div className="bg-[#f0fdf4] p-4 rounded-2xl border border-emerald-100/80 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider font-sans">TICKETS SELECCIONADOS</p>
                    <p className="text-sm font-black text-gray-900 tracking-tight mt-0.5 font-mono">
                      {ticketNumbers.map(n => '#' + n.toString().padStart(3, '0')).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider font-sans">MONTO A PAGAR</p>
                    <p className="text-lg font-black text-[#007a53] mt-0.5">
                      {currencySymbol}{totalAmountPrice}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Conclua sua compra com segurança. Escolha o seu método preferido.
                </p>

                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex gap-2 items-center">
                    <AlertCircle className="shrink-0 text-red-600" size={15} />
                    <span>{validationError}</span>
                  </div>
                )}

                {showError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex gap-2 items-center">
                    <AlertCircle className="shrink-0 text-red-600" size={15} />
                    <span>Favor preencha todos os campos do comprador.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                  
                  {/* Full Name Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider font-sans">NOME COMPLETO</label>
                    <input
                      id="buyer-input-name"
                      type="text"
                      required
                      maxLength={100}
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="julio caraballo"
                      className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Email Address Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider font-sans">ENDEREÇO DE E-MAIL</label>
                    <input
                      id="buyer-input-email"
                      type="email"
                      required
                      maxLength={150}
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="jjmc081970@gmail.com"
                      className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Payment Method Selector matching screenshot */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider font-sans">MÉTODO DE PAGAMENTO</label>
                    <div className="relative">
                      <select
                        id="select-payment-method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'paypal')}
                        className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-sm font-semibold text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer appearance-none pr-24"
                      >
                        <option value="pix">Pix (Brazilian Instant - Mercado Pago)</option>
                        <option value="paypal">PayPal (Global Credit Card / Wallet)</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase pointer-events-none">
                        ACTIVO
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Option Inputs */}
                  {paymentMethod === 'pix' ? (
                    <div className="space-y-2.5 pt-0.5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider font-sans">PIX ALIAS ID</label>
                          <button
                            type="button"
                            onClick={handleCopyPixCode}
                            className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedPix ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedPix ? 'Copiado!' : 'Copiar código Pix'}</span>
                          </button>
                        </div>
                        <input
                          id="buyer-input-cardkey"
                          type="text"
                          required
                          maxLength={100}
                          value={pixAliasId}
                          onChange={(e) => setPixAliasId(e.target.value)}
                          placeholder="alex@ex.com.br"
                          className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                        />
                      </div>

                      {/* Pix Copia e Cola preview box */}
                      <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
                        <div className="flex items-center gap-2 truncate">
                          <QrCode size={16} className="text-emerald-700 shrink-0" />
                          <span className="truncate font-mono text-[10px] text-emerald-800">{pixCopyPasteCode.slice(0, 32)}...</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPixCode}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          {copiedPix ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider font-sans">CONTA PAYPAL / E-MAIL</label>
                      <input
                        id="paypal-input-account"
                        type="email"
                        required
                        maxLength={150}
                        value={paypalAccount}
                        onChange={(e) => setPaypalAccount(e.target.value)}
                        placeholder="buyer@paypal.com"
                        className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200/90 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                      />
                    </div>
                  )}

                  {/* Main Action Button matching screenshot pill style */}
                  <button
                    id="submit-payment-btn"
                    type="submit"
                    className="w-full bg-[#007a53] hover:bg-[#006644] text-white font-extrabold text-xs py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-98 transition-all cursor-pointer uppercase tracking-wider font-sans"
                  >
                    <span>PAGAR AGORA: {currencySymbol}{totalAmountPrice}</span>
                  </button>

                </form>
              </motion.div>
            )}

            {/* Processing State */}
            {status === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-50 border-t-[#007a53] animate-spin" />
                  <Lock className="text-[#007a53]" size={20} />
                </div>
                
                <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-widest pt-2 font-sans">
                  {paymentMethod === 'pix' ? 'Processando pagamento Pix...' : 'Conectando ao PayPal...'}
                </h3>
                <p className="text-xs text-gray-400">Verificando transação em tempo real...</p>
                
                <div className="text-[10px] text-gray-500 flex items-center gap-1.5 pt-4 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100">
                  <Wifi className="text-emerald-700" size={12} />
                  <span className="font-bold tracking-wider">GATEWAY CONNECTED (85ms SLA)</span>
                </div>
              </motion.div>
            )}

            {/* Completed State */}
            {status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#007a53] shadow-lg border border-emerald-100 scale-102">
                  <CheckCircle size={32} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="font-black text-lg text-emerald-950 uppercase tracking-wide font-sans">
                    PAGAMENTO CONFIRMADO!
                  </h3>
                  <p className="text-xs font-medium text-gray-600 max-w-xs leading-relaxed">
                    Seus bilhetes {ticketNumbers.map(n => '#' + n.toString().padStart(3, '0')).join(', ')} estão ativos. Boa sorte!
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/50 w-full text-left font-mono space-y-1 text-[10px] text-gray-400 leading-normal">
                  <p className="font-bold text-gray-600">COMPROVANTE DE PAGAMENTO:</p>
                  <p>Método: <span className="text-gray-700 font-bold">{paymentMethod === 'pix' ? 'Pix Mercado Pago Brasil' : 'PayPal Instant'}</span></p>
                  <p>Transação: <span className="text-gray-700 font-bold">TX_PIX_{Math.random().toString(36).substring(2, 9).toUpperCase()}</span></p>
                </div>

                <button
                  id="payment-success-close-btn"
                  onClick={handleCompletedClose}
                  className="w-full bg-[#007a53] hover:bg-[#006644] text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/10 cursor-pointer uppercase tracking-wider"
                >
                  <span>Fechar Comprovante</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
