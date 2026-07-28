import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
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
              <h2 className="text-xl font-black text-gray-900">Políticas de Privacidad</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-600 leading-relaxed">
              <section>
                <h3 className="text-gray-900 font-bold mb-2">1. Recopilación de Información</h3>
                <p>Recopilamos información que usted nos proporciona directamente cuando utiliza nuestros servicios, como su nombre, dirección de correo electrónico, y datos de transacciones. También podemos recopilar información automáticamente sobre su dispositivo y uso de la plataforma.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">2. Uso de la Información</h3>
                <p>Utilizamos la información recopilada para operar, mantener y mejorar nuestros servicios, procesar transacciones, comunicarnos con usted sobre sorteos y premios, y proteger contra actividades fraudulentas o ilegales.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">3. Compartir Información</h3>
                <p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información con proveedores de servicios de confianza que nos asisten en la operación de nuestra plataforma (como procesadores de pago), siempre bajo estrictos acuerdos de confidencialidad.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">4. Seguridad de los Datos</h3>
                <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal. Todas las transacciones y datos de sorteos están protegidos utilizando cifrado estándar de la industria y registros inmutables donde sea aplicable.</p>
              </section>
              
              <section>
                <h3 className="text-gray-900 font-bold mb-2">5. Sus Derechos</h3>
                <p>Dependiendo de su ubicación, usted puede tener derecho a acceder, corregir, actualizar o solicitar la eliminación de su información personal. Puede ejercer estos derechos contactándonos a través de nuestro soporte técnico.</p>
              </section>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
