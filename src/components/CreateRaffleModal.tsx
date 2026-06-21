import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, Raffle } from '../types';
import { X, Info, Ticket, Calendar, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateRaffleModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (raffle: Omit<Raffle, 'id' | 'soldTickets' | 'reservedTickets' | 'purchases' | 'status'>) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Tesla Model Y',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBJnc9KIN_auLYgcud0dQfnj3F9JtlXaBlDtSm_4HQ5jL3xfnANlDJb5A5YW-6p9RMDgxYGXY2t7Lsmt5LRkQBZUgF54Nj3JYLeRqTJMA98rsGb0VgbB0aFTftMY8qmSkvG5vv9fak44SYHDln7kN-yMRwMlwn5S7Yub9l6Epwgtm8jkdw9gKuUGRjG7a_whgmAgFV2UhHpBYkPVeHafrfn0FISpk5lTmV1sYDR4LH_Rn_i0ZJ6LJLTy1fe6KzVZnDDchkUenKr5TQ'
  },
  {
    name: 'Luxury Villa',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2CwsEqCD-MYPpAnIh4sag2a4IWbng3tHKquQrtUdHNBjvCQ3rL2FDwK02XjagcoXYz_CGPP-_KiMsF8s22T-cXatN35XPIoukvc8f8bZ20z7nKYcJTy0LMFIQXezC8ppt6aCa3eJ_VaN3EtGDCiKX2ThK0Ro8IHukxjEiyWyDxtgAvvKjAqHL55CM1kRE-wDW_rHLIDPXRIJCLpfBXkipXge0nrTOZYBytz1bUTXZGEGF8qt4R-Zjqyiafh_adMKp3vJfd4ecv5Aj'
  },
  {
    name: 'iPhone 15 Pro',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdw-PtwK5GjKBTHZPc4cOkHOzFbRmoyr1hCpKblgFEl1H_K3YpqE1PpnY7Dk26BFmEv4zDjlmtF94AqvU4ifkw6S1xK9s4EgoiWEk7-6dLo2SSJO4WAB4JzEQT3ly_z6yxo35nvFRwQhRLus5LTc7np_V0rZXwJtGFalaW2QbeByZ64Bst2eqCFkjgJvzoepU1VJauSx8irkkmNm5H_byH_YyNLmwZYtX7sPS5ydUdmAjxWDIMkg2qXxVWB5C-SsRNRmvq0k8Guamy'
  }
];

export default function CreateRaffleModal({
  currentLanguage,
  isOpen,
  onClose,
  onSubmit
}: CreateRaffleModalProps) {
  const t = translations[currentLanguage];

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_IMAGES[0].url);
  const [totalTickets, setTotalTickets] = useState(100);
  const [ticketPrice, setTicketPrice] = useState(10.0);
  const [currency, setCurrency] = useState('USD');
  const [subdomain, setSubdomain] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(today.getHours() + 1);
    return today.toISOString().slice(0, 16);
  });
  const [drawDate, setDrawDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().slice(0, 16);
  });
  const [drawMethod, setDrawMethod] = useState<'Automatic' | 'National Lottery' | 'Live Stream'>('Automatic');

  const [isPublishing, setIsPublishing] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !subdomain) {
      setShowValidationWarning(true);
      return;
    }
    setShowValidationWarning(false);
    setIsPublishing(true);

    setTimeout(() => {
      onSubmit({
        name,
        description,
        coverImage,
        totalTickets: Number(totalTickets),
        ticketPrice: Number(ticketPrice),
        currency,
        subdomain,
        startDate,
        drawDate,
        drawMethod
      });
      setIsPublishing(false);
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setSubdomain('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div 
        id="modal-backdrop"
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog Content Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-gray-50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-emerald-700 font-bold">{t.newRaffleTitle}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{t.newRaffleSub}</p>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {showValidationWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
              <AlertCircle className="shrink-0 text-amber-600 mt-0.5" size={18} />
              <div>
                <p className="font-semibold">Faltan campos requeridos</p>
                <p className="text-xs mt-0.5">Por favor completa el nombre de la rifa, descripción y subdominio para continuar.</p>
              </div>
            </div>
          )}

          {/* Section 1: General Info */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Info size={16} />
              {t.generalInfo}
            </h3>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.raffleName}</label>
                <input
                  id="form-raffle-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!subdomain) {
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  placeholder={t.raffleNamePlace}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.prizeDescription}</label>
                <textarea
                  id="form-raffle-desc"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.prizeDescPlace}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Cover presets visual picker */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.coverImage}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      id={`preset-img-${img.name.replace(/\s+/g, '-').toLowerCase()}`}
                      key={img.name}
                      type="button"
                      onClick={() => setCoverImage(img.url)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                        coverImage === img.url 
                          ? 'border-emerald-600 ring-2 ring-emerald-600/25 scale-98' 
                          : 'border-gray-200 hover:border-emerald-600/50'
                      }`}
                    >
                      <img 
                        referrerPolicy="no-referrer"
                        src={img.url} 
                        alt={img.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white font-medium truncate text-center">
                        {img.name}
                      </div>
                      {coverImage === img.url && (
                        <span className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  ))}
                  
                  {/* Upload custom image */}
                  <label className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1 text-center px-1">
                      {currentLanguage === 'es' ? 'Subir Imagen' : currentLanguage === 'pt' ? 'Carregar Imagem' : 'Upload Image'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
                {/* Custom Image Preview if selected */}
                {!PRESET_IMAGES.some(img => img.url === coverImage) && coverImage && (
                  <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check size={14} /> Imagen personalizada cargada
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Ticket Configuration */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Ticket size={16} />
              {t.ticketConfig}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.totalTickets}</label>
                <select
                  id="form-raffle-totaltickets"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
                >
                  <option value={100}>100 ({t.starterTitle} / Pro)</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.pricePerTicket}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    {currency === 'USD' ? '$' : currency === 'BRL' ? 'R$' : 'π'}
                  </span>
                  <input
                    id="form-raffle-price"
                    type="number"
                    step="0.01"
                    min="0.10"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.currency}</label>
                <select
                  id="form-raffle-currency"
                  value={currency}
                  onChange={(e) => {
                    const curr = e.target.value;
                    setCurrency(curr);
                    if (curr === 'Pi') {
                      setTicketPrice(5.0);
                    } else if (curr === 'BRL') {
                      setTicketPrice(50.0);
                    } else {
                      setTicketPrice(10.0);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="BRL">BRL - Brazilian Real (R$)</option>
                  <option value="Pi">Pi - Pi Network (π)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.subdomain}</label>
                <div className="flex items-center">
                  <input
                    id="form-raffle-subdomain"
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-giveaway"
                    className="flex-1 min-w-0 px-4.5 py-2.5 bg-gray-50 border border-gray-200 rounded-l-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                  />
                  <div className="px-3.5 py-2.5 bg-gray-150 border border-l-0 border-gray-200 rounded-r-lg text-xs font-semibold text-gray-500 whitespace-nowrap">
                    .rifasaas.com
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Timeline & Methodology */}
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Calendar size={16} />
              {t.datesMethodology}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.startDate}</label>
                <input
                  id="form-raffle-startdate"
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.drawDate}</label>
                <input
                  id="form-raffle-drawdate"
                  type="datetime-local"
                  required
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{t.drawMethod}</label>
                <select
                  id="form-raffle-drawmethod"
                  value={drawMethod}
                  onChange={(e) => setDrawMethod(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
                >
                  <option value="Automatic">{t.fairSystem}</option>
                  <option value="National Lottery">{t.nationalLottery}</option>
                  <option value="Live Stream">{t.liveStream}</option>
                </select>
                <p className="text-xs text-gray-500 italic mt-0.5">{t.automaticRecommend}</p>
              </div>
            </div>
          </section>

          {/* Footer buttons sticky space inside scroll area */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              id="form-draft-btn"
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-3 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all text-center cursor-pointer"
            >
              {t.saveDraft}
            </button>
            <button
              id="form-publish-btn"
              type="submit"
              disabled={isPublishing}
              className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-600/70 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-700/15 active:scale-95 transition-all outline-hidden flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.creatingRaffleText}
                </>
              ) : (
                t.publishRaffle
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
