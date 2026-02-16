import React from 'react';
import { LucideLayoutDashboard, LucideUsers, LucideSearch, LucideSettings, LucideLogOut } from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'buyers', label: 'Usuarios', icon: LucideUsers },
    { id: 'matching', label: 'Matching', icon: LucideSearch },
    { id: 'settings', label: 'Configuración', icon: LucideSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="bg-white w-full md:w-64 border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded">CRM</span> Inmo
          </h1>
        </div>
        
        <div className="flex flex-row md:flex-col p-2 gap-1 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="mt-auto p-4 border-t border-gray-100 hidden md:block">
          {user && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Sesión activa:</p>
              <p className="text-xs font-medium text-gray-700 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-2"
          >
            <LucideLogOut size={16} />
            Cerrar Sesión
          </button>
          <div className="text-xs text-gray-400">
            v2.0.0 Production
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
        <div className={`mx-auto ${activeTab === 'matching' || activeTab === 'buyers' ? 'max-w-[95%]' : 'max-w-5xl'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
