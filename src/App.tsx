import React from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import IssuanceForm from './components/IssuanceForm';
import DataView from './components/DataView';
import { NavItem } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<NavItem>('beranda');

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda':
        return <Home />;
      case 'ambil-nomor':
        return <IssuanceForm />;
      case 'data':
        return <DataView />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Bar / Breadcrumb */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                {activeTab.replace('-', ' ')}
              </h2>
              <div className="h-1 w-8 bg-purple-600 rounded-full" />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rutan Kelas IIB Sabang</p>
                <p className="text-xs text-gray-500">Senin, 06 April 2026</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/rutan/100/100" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer for mobile/desktop */}
      <footer className="lg:ml-64 py-8 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          &copy; 2026 Rumah Tahanan Negara Kelas IIB Sabang. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
