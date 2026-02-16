import React, { useState, useMemo } from 'react';
import { LucideFilter, LucideSend, LucideCheckCircle, LucideMessageSquare, LucideMail, LucideMessageCircle, LucidePhone, LucideUser } from 'lucide-react';

const MatchingTool = ({ buyers, onBulkContact }) => {
  const [property, setProperty] = useState({
    type: 'piso',
    zone: '',
    price: '',
    rooms: '',
    bathrooms: '',
    parking: '', // '' (no/ns) | 'si'
    terrace: '',
    garden: '',
    pool: '',
  });

  const [messageTemplate, setMessageTemplate] = useState(
    "Hola {nombre}, he visto un {tipo} en {zona} por {precio}€ que podría encajarte. ¿Te interesa verlo?"
  );

  const [simulating, setSimulating] = useState(false);
  const [simulatedCount, setSimulatedCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty(prev => ({ ...prev, [name]: value }));
  };

  // Lógica de Filtrado Actualizada
  const matchedBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      // 1. Tipo de vivienda (Exacto)
      if (buyer.type !== property.type) return false;

      // 2. Zona (Ahora manejamos selección múltiple de zonas en comprador)
      // Si el comprador tiene array "zones", comprobamos si incluye la zona buscada.
      // Si solo tiene string "zone" (legacy), usamos includes.
      if (property.zone) {
         const searchZone = property.zone.toLowerCase();
         if (buyer.zones && buyer.zones.length > 0) {
            // Ver si alguna de las zonas del comprador coincide (parcialmente al menos)
            const hasMatch = buyer.zones.some(z => z.toLowerCase().includes(searchZone));
            if (!hasMatch) return false;
         } else if (buyer.zone) {
            // Legacy check
            if (!buyer.zone.toLowerCase().includes(searchZone)) return false;
         } else {
            // Si no tiene zona definida, asumimos que no hay restricción restrictiva o lo mostramos?
            // Normalmente si busco en "Centro", quiero gente de "Centro". Si no tiene zona, ¿lo descarto?
            // Vamos a ser permisivos: Si no tiene zona, lo mostramos.
         }
      }

      // 3. Presupuesto (Buyer Max >= Property Price)
      const price = Number(property.price);
      if (price && buyer.maxBudget && buyer.maxBudget < price) return false;

      // 4. Habitaciones (Buyer Min <= Property Rooms)
      const rooms = Number(property.rooms);
      if (rooms && buyer.minRooms && buyer.minRooms > rooms) return false;

      // 5. Baños (Buyer Min <= Property Bathrooms)
      const bathrooms = Number(property.bathrooms);
      if (bathrooms && buyer.minBathrooms && buyer.minBathrooms > bathrooms) return false;

      // 6. Parking (Si buyer necesita 'si', property debe tener 'si')
      if (buyer.needParking === 'si' && property.parking !== 'si') return false;

      // 7. Terraza
      if (buyer.needTerrace === 'si' && property.terrace !== 'si') return false;

      // 8. Jardín
      if (buyer.needGarden === 'si' && property.garden !== 'si') return false;

      // 9. Piscina
      if (buyer.needPool === 'si' && property.pool !== 'si') return false;

      return true;
    });
  }, [buyers, property]);

  const generateMessage = (buyer) => {
    return messageTemplate
      .replace(/{nombre}/g, buyer.name)
      .replace(/{tipo}/g, property.type)
      .replace(/{zona}/g, property.zone || 'tu zona de interés')
      .replace(/{precio}/g, property.price || 'consultar');
  };

  const handleSend = (buyer, channel) => {
    const message = generateMessage(buyer);
    
    // Registrar contacto individual
    onBulkContact([buyer.id], message, channel);

    if (channel === 'whatsapp') {
      const cleanPhone = buyer.phone.replace(/\D/g, ''); 
      const phoneParam = cleanPhone.length === 9 ? `34${cleanPhone}` : cleanPhone;
      const url = `https://api.whatsapp.com/send/?phone=${phoneParam}&text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      // Email
      const email = buyer.email;
      if (!email) {
        alert(`El usuario ${buyer.name} no tiene email registrado.`);
        return;
      }
      const subject = "Oportunidad Inmobiliaria";
      const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.open(url, '_blank'); // A veces mailto funciona mejor en _self, pero _blank suele estar bien
    }
  };

   const handleBulkSimulate = (channel) => {
    if (matchedBuyers.length === 0) return;
    setSimulating(true);
    setTimeout(() => {
      const buyerIds = matchedBuyers.map(b => b.id);
      // Usamos el template genérico para el registro histórico
      const genericMsg = messageTemplate
          .replace(/{nombre}/g, 'cliente')
          .replace(/{tipo}/g, property.type)
          .replace(/{zona}/g, property.zone)
          .replace(/{precio}/g, property.price);
      
      onBulkContact(buyerIds, genericMsg, channel);
      setSimulatedCount(matchedBuyers.length);
      setTimeout(() => {
        setSimulating(false);
        setSimulatedCount(0);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Filtros Superiores (Full Width) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <LucideFilter size={20} className="text-blue-500" />
          Filtros de Propiedad
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="type"
              value={property.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            >
              <option value="piso">Piso</option>
              <option value="chalet">Chalet / Casa</option>
              <option value="atico">Ático</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Zona</label>
            <input
              type="text"
              name="zone"
              value={property.zone}
              onChange={handleChange}
              placeholder="Ej: Eixample"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio (€)</label>
            <input
              type="number"
              name="price"
              value={property.price}
              onChange={handleChange}
              placeholder="Max..."
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">Habitaciones</label>
             <input
              type="number"
              name="rooms"
              value={property.rooms}
              onChange={handleChange}
              placeholder="Min..."
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">Baños</label>
             <input
              type="number"
              name="bathrooms"
              value={property.bathrooms}
              onChange={handleChange}
              placeholder="Min..."
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
          </div>
        </div>

        {/* Extras - Checkboxes Row */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
           <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input 
                type="checkbox" 
                checked={property.parking === 'si'} 
                onChange={(e) => setProperty(p => ({...p, parking: e.target.checked ? 'si' : ''}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Parking
           </label>
           <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input 
                type="checkbox" 
                checked={property.terrace === 'si'} 
                onChange={(e) => setProperty(p => ({...p, terrace: e.target.checked ? 'si' : ''}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Terraza
           </label>
           <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input 
                type="checkbox" 
                checked={property.garden === 'si'} 
                onChange={(e) => setProperty(p => ({...p, garden: e.target.checked ? 'si' : ''}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Jardín
           </label>
           <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
              <input 
                type="checkbox" 
                checked={property.pool === 'si'} 
                onChange={(e) => setProperty(p => ({...p, pool: e.target.checked ? 'si' : ''}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Piscina
           </label>
        </div>
      </div>

      {/* 2. Área de Mensaje y Acciones */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
         <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                   <LucideMessageSquare size={18} className="text-green-500" />
                   Personalizar Mensaje
                 </h3>
               </div>
               <textarea
                 className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                 rows="2"
                 value={messageTemplate}
                 onChange={(e) => setMessageTemplate(e.target.value)}
               />
               <p className="text-xs text-gray-500 mt-1">
                 {'{nombre}'}, {'{tipo}'}, {'{zona}'}, {'{precio}'}
               </p>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[200px]">
               <button
                  onClick={() => handleBulkSimulate('whatsapp')}
                  disabled={matchedBuyers.length === 0 || simulating}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-white transition-all w-full
                    ${matchedBuyers.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : simulating
                        ? 'bg-green-700 cursor-wait'
                        : 'bg-green-600 hover:bg-green-700 shadow-md'
                    }`}
                >
                  {simulating ? 'Enviando...' : (
                    <>
                      <LucideMessageCircle size={18} />
                      Simular Envío Masivo
                    </>
                  )}
                </button>
                 <button
                  onClick={() => handleBulkSimulate('email')}
                  disabled={matchedBuyers.length === 0 || simulating}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-white transition-all w-full
                    ${matchedBuyers.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : simulating
                        ? 'bg-blue-700 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                    }`}
                >
                  {simulating ? 'Enviando...' : (
                    <>
                      <LucideMail size={18} />
                      Simular Envío Email
                    </>
                  )}
                </button>

                {simulatedCount > 0 && (
                  <p className="text-xs text-center text-green-600 font-medium">
                    ¡{simulatedCount} mensajes enviados!
                  </p>
                )}
            </div>
         </div>
      </div>

      {/* 3. Resultados (Table) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Usuarios Compatibles ({matchedBuyers.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Usuario</th>
                <th className="px-6 py-3 font-medium">Última Com.</th>
                <th className="px-6 py-3 font-medium">Zonas</th>
                <th className="px-6 py-3 font-medium">Presupuesto</th>
                <th className="px-6 py-3 font-medium">Requisitos</th> {/* Added Requisitos header */}
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matchedBuyers.length > 0 ? (
                matchedBuyers.map(buyer => {
                   const msg = generateMessage(buyer);
                   return (
                    <tr key={buyer.id} className="bg-white border-b hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                           {buyer.name}
                           <span className="text-gray-300 cursor-help" title={msg}>
                              <LucideMessageSquare size={14} />
                           </span>
                        </div>
                        <div className="text-xs text-gray-500">{buyer.phone}</div>
                        <div className="text-xs text-blue-600 mt-1 capitalize">{buyer.managementType}</div>
                      </td>
                      <td className="px-6 py-4">
                        {buyer.contactHistory && buyer.contactHistory.length > 0 ? (
                           (() => {
                             const last = buyer.contactHistory[buyer.contactHistory.length - 1];
                             let Icon = LucidePhone;
                             let color = "text-gray-400";
                             
                             switch(last.channel) {
                               case 'whatsapp': Icon = LucideMessageCircle; color = "text-green-500"; break;
                               case 'email': Icon = LucideMail; color = "text-blue-500"; break;
                               case 'person': Icon = LucideUser; color = "text-purple-500"; break;
                               case 'phone': Icon = LucidePhone; color = "text-orange-500"; break;
                             }

                             return (
                               <div 
                                 className="flex items-center gap-2 cursor-help group/tooltip relative"
                                 title={`Mensaje: ${last.note}\nFeedback: ${last.feedback || 'Sin respuesta'}`}
                               >
                                  <Icon size={16} className={color} />
                                  <div className="flex flex-col">
                                     <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                                       {new Date(last.date).toLocaleDateString()} 
                                       <span className="text-gray-400 font-normal ml-1">
                                         ({Math.floor((new Date() - new Date(last.date)) / (1000 * 60 * 60 * 24))}d)
                                       </span>
                                     </span>
                                     <span className="text-[10px] text-gray-400 max-w-[100px] truncate">
                                       {last.note}
                                     </span>
                                  </div>
                               </div>
                             );
                           })()
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                       <td className="px-6 py-4 max-w-[150px] truncate" title={buyer.zones ? buyer.zones.join(', ') : buyer.zone}>
                          {buyer.zones ? buyer.zones.join(', ') : (buyer.zone || '-')}
                      </td>
                      <td className="px-6 py-4">{buyer.maxBudget ? `${(buyer.maxBudget / 1000)}k €` : '-'}</td>
                      {/* New Column: Requisitos */}
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              {buyer.minRooms && <span>{buyer.minRooms}h</span>}
                              {buyer.minRooms && buyer.minBathrooms && <span className="text-gray-300">|</span>}
                              {buyer.minBathrooms && <span>{buyer.minBathrooms}b</span>}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                               {buyer.needParking === 'si' && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-[3px] border border-gray-200 text-[10px]">PK</span>}
                               {buyer.needTerrace === 'si' && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-[3px] border border-orange-100 text-[10px]">Ter</span>}
                               {buyer.needGarden === 'si' && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded-[3px] border border-green-100 text-[10px]">Jar</span>}
                               {buyer.needPool === 'si' && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-[3px] border border-blue-100 text-[10px]">Pis</span>}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button
                             onClick={() => handleSend(buyer, 'whatsapp')}
                             className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors shadow-sm"
                             title="Enviar WhatsApp"
                           >
                             <LucideMessageCircle size={18} />
                           </button>
                           <button
                             onClick={() => handleSend(buyer, 'email')}
                             className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
                             title="Enviar Email"
                           >
                             <LucideMail size={18} />
                           </button>
                         </div>
                      </td>
                    </tr>
                   );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400"> {/* Updated colSpan */}
                    <div className="flex flex-col items-center gap-2">
                       <LucideFilter size={32} className="opacity-20" />
                       <p>No hay usuarios que coincidan con estos criterios.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MatchingTool;
