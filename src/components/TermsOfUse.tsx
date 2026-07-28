import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface TermsOfUseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfUse({ isOpen, onClose }: TermsOfUseProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">Términos de Uso</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-600 leading-relaxed">
              <section>
                <h3 className="text-gray-900 font-bold mb-2">1. Aceptación de los Términos</h3>
                <p>Al acceder o utilizar RifaSaaS, usted acepta estar sujeto a estos Términos de Uso y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a esta plataforma.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">2. Uso de la Plataforma</h3>
                <p>RifaSaaS proporciona herramientas de software para la gestión de sorteos. Los organizadores son los únicos responsables de garantizar que sus sorteos cumplan con todas las leyes locales, estatales y nacionales aplicables relacionadas con rifas y juegos de azar.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">3. Cuentas de Usuario</h3>
                <p>Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Debe notificarnos inmediatamente sobre cualquier violación de seguridad o uso no autorizado de su cuenta.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">4. Pagos y Reembolsos</h3>
                <p>Todas las compras de boletos son definitivas. Los reembolsos solo se emitirán a discreción del organizador del sorteo o si un sorteo es cancelado antes de su fecha de realización. RifaSaaS no retiene fondos de los organizadores.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">5. Limitación de Responsabilidad</h3>
                <p>RifaSaaS actúa únicamente como un proveedor de tecnología. No somos responsables por los premios no entregados por los organizadores ni por disputas entre participantes y organizadores. El uso de la plataforma es bajo su propio riesgo.</p>
              </section>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
