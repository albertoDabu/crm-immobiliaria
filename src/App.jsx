import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BuyerForm from './components/BuyerForm';
import BuyerList from './components/BuyerList';
import MatchingTool from './components/MatchingTool';
import BuyerDetailModal from './components/BuyerDetailModal';
import { api } from './lib/api';
import { useAuth } from './hooks/useAuth';
import { LucidePlus, LucideDownload, LucideUpload, LucideLogOut } from 'lucide-react';

function App() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('buyers'); // Default tab: buyers
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLastContact, setFilterLastContact] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); 
  
  // Configuración dinámica de días para estadísticas
  const [statsDays, setStatsDays] = useState(7);
  const [attentionDays, setAttentionDays] = useState(30);

  // Cargar contactos al montar el componente
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const contacts = await api.getContacts();
      setBuyers(contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      alert('Error al cargar contactos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBuyer(null);
    setShowForm(true);
  };

  const handleEditBuyer = (buyer) => {
    setEditingBuyer(buyer);
    setShowForm(true);
    setSelectedBuyer(null);
  };

  const handleBuyerClick = (buyer) => {
    setSelectedBuyer(buyer);
  };

  const handleUpdateBuyerDirectly = async (updatedBuyer) => {
    try {
      await api.updateContact(updatedBuyer.id, updatedBuyer);
      // Actualizar estado local optimísticamente
      setBuyers(prev => prev.map(b => b.id === updatedBuyer.id ? updatedBuyer : b));
      setSelectedBuyer(updatedBuyer);
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Error al actualizar contacto: ' + error.message);
    }
  };

  const handleSaveBuyer = async (savedBuyer) => {
    try {
      if (editingBuyer) {
        // Actualizar existente
        await api.updateContact(savedBuyer.id, savedBuyer);
        setBuyers(prev => prev.map(b => b.id === savedBuyer.id ? savedBuyer : b));
      } else {
        // Crear nuevo
        const newContact = await api.createContact(savedBuyer);
        setBuyers(prev => [...prev, newContact]);
      }
      setShowForm(false);
      setEditingBuyer(null);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error al guardar contacto: ' + error.message);
    }
  };

  const handleDeleteBuyer = async (id) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.deleteContact(id);
        setBuyers(prev => prev.filter(b => b.id !== id));
        if (selectedBuyer?.id === id) setSelectedBuyer(null);
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error al eliminar contacto: ' + error.message);
      }
    }
  };

  const handleBulkContact = async (ids, message, channel = 'whatsapp') => {
    try {
      await api.bulkContact(ids, message, channel);
      // Recargar contactos para obtener el historial actualizado
      await loadContacts();
      alert(`Contacto registrado para ${ids.length} usuario(s)`);
    } catch (error) {
      console.error('Error in bulk contact:', error);
      alert('Error al registrar contactos: ' + error.message);
    }
  };

  // Lógica de Filtrado y Ordenación
  const filteredBuyers = buyers.filter(buyer => {
    // 1. Buscador de Texto
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const matchesName = buyer.name?.toLowerCase().includes(lowerTerm);
      const matchesPhone = buyer.phone?.includes(searchTerm);
      const matchesEmail = buyer.email?.toLowerCase().includes(lowerTerm);
      if (!matchesName && !matchesPhone && !matchesEmail) return false;
    }

    // 2. Filtro por Tipo
    if (filterType !== 'all') {
      if (buyer.managementType !== filterType) return false;
    }

    // 3. Filtro por Último Contacto (usado en stats cards)
    if (filterLastContact !== 'all') {
      if (!buyer.lastContact && filterLastContact !== 'never') return false;
      if (!buyer.lastContact && filterLastContact === 'never') return true;
      
      const diffTime = Math.abs(new Date() - new Date(buyer.lastContact));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (filterLastContact === 'recent') return diffDays <= statsDays;
      if (filterLastContact === 'needsAttention') return diffDays > attentionDays;

      if (filterLastContact === '7days' && diffDays > 7) return false;
      if (filterLastContact === '15days' && diffDays > 15) return false;
      if (filterLastContact === '30days' && diffDays > 30) return false;
      if (filterLastContact === 'never') return false; 
    }

    // 4. Filtro por Urgencia (Alta/Media/Baja)
    if (filterUrgency !== 'all') {
      if (buyer.urgency !== filterUrgency) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortOrder === 'desc') {
       if (!a.lastContact) return 1;
       if (!b.lastContact) return -1;
       return new Date(b.lastContact) - new Date(a.lastContact);
    } else if (sortOrder === 'asc') {
       if (!a.lastContact) return 1;
       if (!b.lastContact) return -1;
       return new Date(a.lastContact) - new Date(b.lastContact);
    }
    return 0;
  });

  // Funciones de Backup JSON
  const exportData = () => {
    const dataStr = JSON.stringify(buyers, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm-backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          if (confirm(`Se importarán ${imported.length} usuarios. Esto reemplazará los actuales.`)) {
            setBuyers(imported);
          }
        } else {
          alert('El archivo no tiene el formato correcto.');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Cálculo de Estadísticas (Live Counts)
  const getStats = () => {
    const total = buyers.length;
    const compradores = buyers.filter(b => b.managementType === 'comprador').length;
    const inquilinos = buyers.filter(b => b.managementType === 'inquilino').length;
    const vendedores = buyers.filter(b => b.managementType === 'propietario_venta').length;
    const arrendadores = buyers.filter(b => b.managementType === 'propietario_alquiler').length;
    
    // Recent contact
    const recentContacts = buyers.filter(b => {
      if (!b.lastContact) return false;
      const diff = new Date() - new Date(b.lastContact);
      return diff <= statsDays * 24 * 60 * 60 * 1000;
    }).length;

    // Needs attention
    const needsAttention = buyers.filter(b => {
      if (!b.lastContact) return true;
      const diff = new Date() - new Date(b.lastContact);
      return diff > attentionDays * 24 * 60 * 60 * 1000;
    }).length;

    return { total, compradores, inquilinos, vendedores, arrendadores, recentContacts, needsAttention };
  };

  const stats = getStats();

  // Helper para aplicar filtros rápidos
  const applyQuickFilter = (type, value) => {
    // Reset inputs
    setSearchTerm('');
    if (type === 'type') {
      setFilterType(value);
      setFilterLastContact('all');
      setFilterUrgency('all');
    } else if (type === 'lastContact') {
      setFilterLastContact(value); // 'recent' or 'needsAttention'
      setFilterType('all');
      setFilterUrgency('all');
    } else if (type === 'reset') {
      setFilterType('all');
      setFilterLastContact('all');
      setFilterUrgency('all');
      setSearchTerm('');
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      user={user}
      onLogout={async () => {
        if (confirm('¿Cerrar sesión?')) {
          await signOut();
        }
      }}
    >
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {activeTab === 'buyers' ? 'Gestión de Usuarios' : 
           activeTab === 'matching' ? 'Matching y Envíos' : 'Configuración'}
        </h2>
        
        {/* ... buttons ... */}
        <div className="flex gap-2">
          {activeTab === 'buyers' && !showForm && (
            <button 
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              <LucidePlus size={18} />
              Nuevo
            </button>
          )}

          {activeTab === 'settings' && (
             <div className="flex gap-2">
               <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                 <LucideUpload size={18} />
                 Importar
                 <input type="file" className="hidden" accept=".json" onChange={importData} />
               </label>
               <button 
                 onClick={exportData}
                 className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
               >
                 <LucideDownload size={18} />
                 Exportar
               </button>
             </div>
          )}
        </div>
      </div>

      {activeTab === 'buyers' && (
        showForm ? (
          <BuyerForm 
            onSave={handleSaveBuyer} 
            onCancel={() => { setShowForm(false); setEditingBuyer(null); }} 
            initialData={editingBuyer}
          />
        ) : (
        <>
            {/* Stats Bar - Single Compact Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 mb-4">
               {/* Total */}
               <div 
                  onClick={() => applyQuickFilter('reset')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-blue-400 transition-colors flex flex-col justify-between h-20 shadow-sm ${filterType === 'all' && filterLastContact === 'all' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
               >
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
               </div>
               
               {/* Compradores */}
               <div 
                  onClick={() => applyQuickFilter('type', 'comprador')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-blue-400 transition-colors flex flex-col justify-between h-20 shadow-sm ${filterType === 'comprador' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
               >
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Compradores</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.compradores}</p>
               </div>

               {/* Vendedores */}
               <div 
                  onClick={() => applyQuickFilter('type', 'propietario_venta')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-amber-400 transition-colors flex flex-col justify-between h-20 shadow-sm ${filterType === 'propietario_venta' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-gray-200'}`}
               >
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Vendedores</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.vendedores}</p>
               </div>

               {/* Inquilinos */}
               <div 
                  onClick={() => applyQuickFilter('type', 'inquilino')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-purple-400 transition-colors flex flex-col justify-between h-20 shadow-sm ${filterType === 'inquilino' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'}`}
               >
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Inquilinos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.inquilinos}</p>
               </div>
               
               {/* Arrendadores */}
               <div 
                  onClick={() => applyQuickFilter('type', 'propietario_alquiler')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-indigo-400 transition-colors flex flex-col justify-between h-20 shadow-sm ${filterType === 'propietario_alquiler' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}
               >
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Arrendadores</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.arrendadores}</p>
               </div>

               {/* Contactados (Configurable) */}
               <div 
                  onClick={() => applyQuickFilter('lastContact', 'recent')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-green-400 transition-colors flex flex-col justify-between h-20 shadow-sm relative overflow-hidden ${filterLastContact === 'recent' ? 'border-green-500 ring-1 ring-green-500 bg-green-50' : 'border-gray-200'}`}
               >
                  <div className="flex justify-between items-start">
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Contactados</p>
                     <LucideFilter size={14} className="text-green-300 absolute top-2 right-2" />
                  </div>
                  <div className="flex items-end justify-between">
                     <p className="text-2xl font-bold text-green-600">{stats.recentContacts}</p>
                     <select 
                       onClick={(e) => e.stopPropagation()}
                       value={statsDays}
                       onChange={(e) => setStatsDays(Number(e.target.value))}
                       className="text-[10px] border-none bg-transparent p-0 text-gray-500 focus:ring-0 cursor-pointer hover:text-green-700 font-medium text-right"
                     >
                       <option value="3">3d</option>
                       <option value="7">7d</option>
                       <option value="15">15d</option>
                       <option value="30">30d</option>
                     </select>
                  </div>
               </div>

               {/* Atención (Configurable) */}
               <div 
                  onClick={() => applyQuickFilter('lastContact', 'needsAttention')}
                  className={`bg-white p-2 rounded-lg border cursor-pointer hover:border-red-400 transition-colors flex flex-col justify-between h-20 shadow-sm relative overflow-hidden ${filterLastContact === 'needsAttention' ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
               >
                  <div className="flex justify-between items-start">
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider truncate" title="Necesitan Atención">Atención</p>
                     <LucideFilter size={14} className="text-red-300 absolute top-2 right-2" />
                  </div>
                  <div className="flex items-end justify-between">
                     <p className="text-2xl font-bold text-red-600">{stats.needsAttention}</p>
                     <select 
                       onClick={(e) => e.stopPropagation()}
                       value={attentionDays}
                       onChange={(e) => setAttentionDays(Number(e.target.value))}
                       className="text-[10px] border-none bg-transparent p-0 text-gray-500 focus:ring-0 cursor-pointer hover:text-red-700 font-medium text-right"
                     >
                       <option value="15">+15d</option>
                       <option value="30">+30d</option>
                       <option value="45">+45d</option>
                       <option value="60">+60d</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-3 items-end">
               <div className="flex-1 w-full relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buscar</label>
                  <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Nombre, tlf, email..." 
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
               </div>
 
               <div className="w-full lg:w-40">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                  <select 
                     className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                     value={filterType}
                     onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="comprador">Comprador</option>
                    <option value="inquilino">Inquilino</option>
                    <option value="propietario_venta">Vendedor</option>
                    <option value="propietario_alquiler">Arrendador</option>
                  </select>
               </div>
 
               <div className="w-full lg:w-32">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Urgencia</label>
                  <select 
                     className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                     value={filterUrgency}
                     onChange={(e) => setFilterUrgency(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
               </div>
 
               <div className="w-full lg:w-40">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Orden</label>
                  <select 
                     className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                     value={sortOrder}
                     onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Fecha: Recientes</option>
                    <option value="asc">Fecha: Antiguos</option>
                  </select>
               </div>
            </div>
 
            <BuyerList 
              buyers={filteredBuyers} 
              onDelete={handleDeleteBuyer} 
              onEdit={handleEditBuyer}
              onBuyerClick={handleBuyerClick}
            />
        </>
        )
      )}

      {activeTab === 'matching' && (
        <MatchingTool buyers={buyers} onBulkContact={handleBulkContact} />
      )}

      {selectedBuyer && (
        <BuyerDetailModal 
          buyer={selectedBuyer} 
          onClose={() => setSelectedBuyer(null)}
          onEdit={handleEditBuyer}
          onUpdateBuyer={handleUpdateBuyerDirectly}
        />
      )}

    </Layout>
  );
}

export default App;
