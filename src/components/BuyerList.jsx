import { LucidePhone, LucideCalendar, LucideHome, LucideTrash2, LucideEdit, LucideSun, LucideFlower2, LucideWaves } from 'lucide-react';

const BuyerList = ({ buyers, onDelete, onEdit, onBuyerClick }) => {
  if (buyers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
        <LucideHome className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p>No hay contactos registrados aún.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getDaysSinceContact = (dateString) => {
    if (!dateString) return Infinity; // Nunca contactado
    const diff = new Date() - new Date(dateString);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (days) => {
    if (days === Infinity) return 'bg-gray-100 text-gray-600';
    if (days < 7) return 'bg-green-100 text-green-700';
    if (days < 15) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {buyers.map((buyer) => {
        const days = getDaysSinceContact(buyer.lastContact);
        const zonesDisplay = buyer.zones && buyer.zones.length > 0 
          ? buyer.zones.join(', ') 
          : buyer.zone;

        return (
          <div 
            key={buyer.id} 
            onClick={() => onBuyerClick(buyer)}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer relative group flex flex-col h-full"
          >
            <div className="p-5 flex-1">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(buyer); }}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors bg-white rounded-full shadow-sm"
                    title="Editar"
                  >
                    <LucideEdit size={16} />
                  </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(buyer.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm"
                    title="Eliminar"
                  >
                    <LucideTrash2 size={16} />
                  </button>
              </div>

              <div className="flex items-start justify-between mb-3 pr-16">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{buyer.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                    <span className="capitalize px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                      {buyer.managementType || 'Comprador'}
                    </span>
                  </div>
                </div>
              </div>

               <div className="mb-3 text-xs text-gray-500 flex items-center gap-3 flex-wrap">
                 <span className="flex items-center gap-1"><LucideHome size={12}/> {buyer.minRooms}h</span>
                 {buyer.minBathrooms && <span className="flex items-center gap-1"> {buyer.minBathrooms}b</span>}
                 {buyer.needParking === 'si' && <span className="text-blue-600 font-medium border border-blue-200 px-1 rounded bg-blue-50">PK</span>}
                 {buyer.needTerrace === 'si' && <span className="text-orange-500" title="Terraza"><LucideSun size={12}/></span>}
                 {buyer.needGarden === 'si' && <span className="text-green-600" title="Jardín"><LucideFlower2 size={12}/></span>}
                 {buyer.needPool === 'si' && <span className="text-blue-500" title="Piscina"><LucideWaves size={12}/></span>}
               </div>

              <div className="flex items-center justify-between mb-4">
                 <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(days)}`}>
                    {days === Infinity ? 'Sin contacto' : `${days} días (${formatDate(buyer.lastContact)})`}
                 </span>
                 <span className="text-xs text-gray-400">
                   Reg: {formatDate(buyer.registrationDate)}
                 </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase text-gray-400">Tlf:</span>
                  <span className="font-mono">{buyer.phone}</span>
                </div>
                {buyer.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase text-gray-400">Email:</span>
                    <span className="truncate max-w-[150px]" title={buyer.email}>{buyer.email}</span>
                  </div>
                )}
                 <div className="flex justify-between items-center">
                  <span className="text-xs uppercase text-gray-400">Zonas:</span>
                  <span className="truncate max-w-[150px] text-right" title={zonesDisplay}>{zonesDisplay || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase text-gray-400">Presupuesto:</span>
                  <span className="font-medium text-gray-900">
                    {buyer.maxBudget ? `${(buyer.maxBudget / 1000).toFixed(0)}k €` : '-'}
                  </span>
                </div>
              </div>
            </div>
            
             <div className="bg-gray-50 px-4 py-2 rounded-b-lg border-t border-gray-100 text-center text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver Ficha Completa
             </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuyerList;
