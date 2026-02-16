import React, { useState } from 'react';
import { LucideX, LucideEdit, LucideCalendar, LucideMessageSquare, LucideSave, LucideTrash2, LucidePlus, LucidePhone, LucideMail, LucideUser, LucideMessageCircle } from 'lucide-react';

const BuyerDetailModal = ({ buyer, onClose, onEdit, onUpdateBuyer }) => {
  const [activeTab, setActiveTab] = useState('info');
  
  // Nuevo Estado para añadir notas
  const [newNote, setNewNote] = useState('');
  const [newChannel, setNewChannel] = useState('phone'); // phone, whatsapp, email, person

  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [tempNote, setTempNote] = useState('');
  const [tempFeedback, setTempFeedback] = useState('');

  if (!buyer) return null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry = {
      date: new Date().toISOString(),
      note: newNote,
      channel: newChannel, // 'phone', 'whatsapp', 'email', 'person'
      feedback: '', // Respuesta del cliente vacía inicialmente
      type: 'manual'
    };

    const updatedBuyer = {
      ...buyer,
      contactHistory: [...(buyer.contactHistory || []), newEntry],
      lastContact: new Date().toISOString()
    };

    onUpdateBuyer(updatedBuyer);
    setNewNote('');
    // No reseteamos canal para facilitar entradas consecutivas del mismo tipo
  };

  const startEditing = (index, item) => {
    setEditingId(index);
    setTempNote(item.note || '');
    setTempFeedback(item.feedback || '');
  };

  const saveEditing = (index) => {
    const updatedHistory = [...buyer.contactHistory];
    updatedHistory[index] = { 
      ...updatedHistory[index], 
      note: tempNote,
      feedback: tempFeedback 
    };
    
    onUpdateBuyer({ ...buyer, contactHistory: updatedHistory });
    setEditingId(null);
  };

  const deleteHistoryItem = (index) => {
    if(!window.confirm('¿Seguro que quieres borrar esta nota?')) return;
    const updatedHistory = buyer.contactHistory.filter((_, i) => i !== index);
    onUpdateBuyer({ ...buyer, contactHistory: updatedHistory });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'whatsapp': return <LucideMessageCircle size={16} className="text-green-500" />;
      case 'email': return <LucideMail size={16} className="text-blue-500" />;
      case 'person': return <LucideUser size={16} className="text-purple-500" />;
      case 'phone': 
      default: return <LucidePhone size={16} className="text-orange-500" />;
    }
  };

  const getChannelLabel = (channel) => {
    switch(channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'person': return 'Presencial';
      case 'phone': return 'Llamada';
      default: return 'Otro';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header (unchanged) */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{buyer.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{buyer.managementType} • {buyer.phone}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { onEdit(buyer); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <LucideEdit size={18} />
              Editar
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LucideX size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white shrink-0">
          <button 
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('info')}
          >
            Datos Ficha
          </button>
          <button 
            className={`flex-1 p-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('history')}
          >
            Comunicaciones
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* (Info card content remains largely the same, abbreviating for clarity if possible or keeping full) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-400 uppercase mb-3 text-xs tracking-wider">Contacto</h3>
                   <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Teléfono 1:</span>
                      <span className="font-medium">{buyer.phone}</span>
                    </div>
                    {buyer.phone2 && (
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-gray-500">Teléfono 2:</span>
                        <span className="font-medium">{buyer.phone2}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{buyer.email || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Idioma:</span>
                      <span className="font-medium uppercase">{buyer.language || 'ES'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Fecha Alta:</span>
                      <span className="font-medium">{formatDate(buyer.registrationDate)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Última Com.:</span>
                      <span className={`font-medium ${!buyer.lastContact ? 'text-gray-400' : ''}`}>
                        {buyer.lastContact ? formatDate(buyer.lastContact) : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-400 uppercase mb-3 text-xs tracking-wider">Busca</h3>
                   <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium capitalize">{buyer.type}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Presupuesto:</span>
                      <span className="font-medium">
                         {buyer.minBudget ? `${buyer.minBudget/1000}k - ` : ''}
                         {buyer.maxBudget ? `${buyer.maxBudget/1000}k` : '-'} €
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Distribución:</span>
                      <span className="font-medium">{buyer.minRooms}hab • {buyer.minBathrooms || 1}baños</span>
                    </div>

                    <div className="py-2 border-b border-gray-50">
                      <span className="text-gray-500 block mb-1 text-xs">Extras requeridos:</span>
                      <div className="flex flex-wrap gap-2">
                        {buyer.needParking === 'si' && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">Parking</span>}
                        {buyer.needTerrace === 'si' && <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">Terraza</span>}
                        {buyer.needGarden === 'si' && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">Jardín</span>}
                        {buyer.needPool === 'si' && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">Piscina</span>}
                        {buyer.needParking !== 'si' && buyer.needTerrace !== 'si' && buyer.needGarden !== 'si' && buyer.needPool !== 'si' && (
                          <span className="text-gray-400 text-xs italic">Ninguno específico</span>
                        )}
                      </div>
                    </div>
                     <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Motivo:</span>
                      <span className="font-medium capitalize">{buyer.intent || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Urgencia:</span>
                      <span className="font-medium capitalize">{buyer.urgency || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm md:col-span-2">
                   <h3 className="font-semibold text-gray-400 uppercase mb-3 text-xs tracking-wider">Zonas de Interés</h3>
                   <div className="flex flex-wrap gap-2">
                      {buyer.zones && buyer.zones.length > 0 ? (
                        buyer.zones.map(z => (
                          <span key={z} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                            {z}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No especificadas (Todas)</span>
                      )}
                   </div>
                </div>

                {buyer.contact2 && buyer.contact2.name && (
                   <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm md:col-span-2">
                    <h3 className="font-semibold text-gray-400 uppercase mb-3 text-xs tracking-wider">Segundo Contacto</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div><span className="text-gray-500 mr-2">Nombre:</span>{buyer.contact2.name}</div>
                       <div><span className="text-gray-500 mr-2">Relación:</span>{buyer.contact2.relation}</div>
                       <div><span className="text-gray-500 mr-2">Tlf:</span>{buyer.contact2.phone}</div>
                       <div><span className="text-gray-500 mr-2">Email:</span>{buyer.contact2.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col h-full">
               {/* Nueva Acción UI */}
               <form onSubmit={handleAddNote} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <LucidePlus size={16} className="text-blue-600" /> Registrar Nueva Acción
                  </h3>
                  
                  {/* Selector de Canal */}
                  <div className="flex gap-2 mb-3">
                    {[
                      { id: 'phone', icon: LucidePhone, label: 'Llamada' },
                      { id: 'whatsapp', icon: LucideMessageCircle, label: 'WhatsApp' },
                      { id: 'email', icon: LucideMail, label: 'Email' },
                      { id: 'person', icon: LucideUser, label: 'Visita' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewChannel(c.id)}
                        className={`flex-1 py-2 px-1 rounded-md flex flex-col items-center gap-1 text-xs border transition-colors ${newChannel === c.id ? 'bg-white border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                      >
                        <c.icon size={16} />
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Detalles de la ${getChannelLabel(newChannel).toLowerCase()}...`}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!newNote.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium text-sm"
                    >
                      Guardar
                    </button>
                  </div>
               </form>

               {/* Timeline */}
               <div className="space-y-4 pb-4">
                  {buyer.contactHistory && buyer.contactHistory.length > 0 ? (
                    [...buyer.contactHistory].reverse().map((item, idx) => {
                      const realIndex = buyer.contactHistory.length - 1 - idx;
                      const isEditing = editingId === realIndex;

                      return (
                        <div key={realIndex} className="flex gap-4 group">
                          {/* Timeline Icon */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 z-10">
                               {getChannelIcon(item.channel || 'phone')}
                            </div>
                            <div className="w-px h-full bg-gray-200 -mt-1 group-last:hidden"></div>
                          </div>
                          
                          <div className="flex-1 pb-6">
                            <div className={`p-3 rounded-lg border shadow-sm relative ${item.feedback ? 'bg-white border-blue-100' : 'bg-white border-gray-100'}`}>
                               <div className="flex justify-between items-start mb-2 border-b border-gray-50 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                      {getChannelLabel(item.channel || 'phone')}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      • {formatDate(item.date)}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isEditing && (
                                      <>
                                        <button 
                                          onClick={() => startEditing(realIndex, item)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                          title="Editar"
                                        >
                                          <LucideEdit size={14} />
                                        </button>
                                        <button 
                                          onClick={() => deleteHistoryItem(realIndex)}
                                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                          title="Borrar"
                                        >
                                          <LucideTrash2 size={14} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                               </div>

                               {/* Contenido (Acción) */}
                               <div className="mb-3">
                                 {isEditing ? (
                                    <div className="mb-2">
                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Tu Acción</label>
                                      <input 
                                        className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                                        value={tempNote}
                                        onChange={(e) => setTempNote(e.target.value)}
                                      />
                                    </div>
                                 ) : (
                                   <div className="text-sm text-gray-800">{item.note}</div>
                                 )}
                               </div>

                               {/* Feedback (Respuesta) */}
                               {(item.feedback || isEditing) && (
                                 <div className={`mt-2 p-2 rounded-md ${isEditing ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                    {isEditing ? (
                                      <div>
                                        <label className="block text-xs font-semibold text-yellow-700 mb-1 flex items-center gap-1">
                                          <LucideMessageSquare size={10} /> Feedback / Respuesta Cliente
                                        </label>
                                        <textarea
                                          className="w-full p-2 border border-yellow-200 rounded text-sm bg-white focus:outline-none focus:border-yellow-400"
                                          rows="2"
                                          placeholder="¿Qué contestó el cliente?"
                                          value={tempFeedback}
                                          onChange={(e) => setTempFeedback(e.target.value)}
                                        />
                                        <div className="flex justify-end mt-2">
                                          <button 
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1 text-xs text-gray-500 mr-2 hover:bg-gray-200 rounded"
                                          >Cancelar</button>
                                          <button 
                                            onClick={() => saveEditing(realIndex)}
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                                          >
                                            <LucideSave size={12} /> Guardar Cambios
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 items-start">
                                         <LucideMessageSquare size={14} className="text-gray-400 mt-1 shrink-0" />
                                         <div>
                                            <span className="text-xs font-semibold text-gray-500 block mb-0.5">Feedback:</span>
                                            <p className="text-sm text-gray-600 italic">"{item.feedback}"</p>
                                         </div>
                                      </div>
                                    )}
                                 </div>
                               )}
                               
                               {/* Botón para añadir feedback si está vacío y no se está editando */}
                               {!item.feedback && !isEditing && (
                                 <button 
                                  onClick={() => startEditing(realIndex, item)}
                                  className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                   <LucidePlus size={12} /> Añadir Feedback
                                 </button>
                               )}

                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <LucideCalendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p>Sin historial registrado.</p>
                      <p className="text-xs">Usa el formulario de arriba para registrar la primera acción.</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDetailModal;
