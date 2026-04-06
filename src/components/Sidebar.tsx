import React from 'react';
import { Home, PlusCircle, Database, ChevronRight, Menu, X } from 'lucide-react';
import { NavItem } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'ambil-nomor', label: 'Ambil Nomor', icon: PlusCircle },
    { id: 'data', label: 'Data Surat', icon: Database },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200">
                RS
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Rutan Sabang</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Sistem Nomor Surat</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as NavItem);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-purple-50 text-purple-600 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={18} className={activeTab === item.id ? "text-purple-600" : "text-gray-400"} />
                {item.label}
                {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-1">Status Sistem</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
