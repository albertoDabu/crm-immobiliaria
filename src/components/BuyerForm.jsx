import React, { useState, useEffect } from 'react';
import { LucideSave, LucideX } from 'lucide-react';

const BARCELONA_ZONES = [
  'Ciutat Vella', 'Eixample', 'Sants-Montjuïc', 'Les Corts', 
  'Sarrià-Sant Gervasi', 'Gràcia', 'Horta-Guinardó', 'Nou Barris', 
  'Sant Andreu', 'Sant Martí'
];

const BuyerForm = ({ onSave, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phone2: '',
    email: '',
    managementType: 'comprador', // propietario_venta, propietario_alquiler, inquilino, comprador
    registrationDate: new Date().toISOString().slice(0, 10),
    type: 'piso',
    zones: [], // Array de zonas
    minBudget: '',
    maxBudget: '',
    minRooms: '',
    minBathrooms: '', // Nuevo
    needParking: 'no', // Nuevo: 'si', 'no', 'indiferente'
    needTerrace: 'no', // Nuevo
    needGarden: 'no', // Nuevo
    needPool: 'no', // Nuevo
    urgency: 'media', // alta, media, baja
    intent: 'vivir', // vivir, invertir
    usage: 'propio', // propio, familiar
    language: 'es',
    notes: '',
    contact2: {
      name: '',
      phone: '',
      email: '',
      relation: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        zones: initialData.zones || (initialData.zone ? [initialData.zone] : []),
        surname: initialData.surname || '',
        contact2: initialData.contact2 || { name: '', relation: '', phone: '', email: '' },
        minBathrooms: initialData.minBathrooms || '',
        needParking: initialData.needParking || 'indiferente',
        needTerrace: initialData.needTerrace || 'indiferente',
        needGarden: initialData.needGarden || 'indiferente',
        needPool: initialData.needPool || 'indiferente'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact2.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact2: { ...prev.contact2, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleZoneChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, zones: options }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('El nombre es obligatorio');
      return;
    }

    const dataToSave = {
      ...formData,
      id: initialData ? initialData.id : Date.now().toString(),
      lastContact: initialData?.lastContact || null,
      contactHistory: initialData?.contactHistory || [],
      minBudget: Number(formData.minBudget) || 0,
      maxBudget: Number(formData.maxBudget) || 0,
      minRooms: Number(formData.minRooms) || 0,
      // Retrocompatibilidad: primera zona como "zone" principal para listados antiguos
      zone: formData.zones.length > 0 ? formData.zones.join(', ') : '' 
    };

    onSave(dataToSave);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Editar Contacto' : 'Nuevo Contacto'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <LucideX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Sección 1: Datos de Gestión */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-600 uppercase mb-3">Datos de Gestión</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
              <select
                name="managementType"
                value={formData.managementType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="comprador">Comprador</option>
                <option value="inquilino">Inquilino</option>
                <option value="propietario_venta">Propietario (Venta)</option>
                <option value="propietario_alquiler">Propietario (Alquiler)</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inscripción</label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección 2: Datos Personales */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 border-b pb-1">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: Juan Pérez"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 2 (Opcional)</label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="es">Español</option>
                <option value="ca">Catalán</option>
                <option value="en">Inglés</option>
                <option value="fr">Francés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección 3: Segunda Persona de Contacto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Segunda Persona de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
              <input
                type="text"
                name="contact2.name"
                value={formData.contact2.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Relación</label>
              <input
                type="text"
                name="contact2.relation"
                value={formData.contact2.relation}
                onChange={handleChange}
                placeholder="Ej: Pareja, Socio..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
              <input
                type="tel"
                name="contact2.phone"
                value={formData.contact2.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                name="contact2.email"
                value={formData.contact2.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

         {/* Sección 4: Preferencias */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 border-b pb-1">Preferencias de Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <div className="flex gap-4">
                 <label className="flex items-center gap-2">
                   <input type="radio" name="intent" value="vivir" checked={formData.intent === 'vivir'} onChange={handleChange} />
                   Vivir
                 </label>
                 <label className="flex items-center gap-2">
                   <input type="radio" name="intent" value="invertir" checked={formData.intent === 'invertir'} onChange={handleChange} />
                   Invertir
                 </label>
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uso</label>
              <div className="flex gap-4">
                 <label className="flex items-center gap-2">
                   <input type="radio" name="usage" value="propio" checked={formData.usage === 'propio'} onChange={handleChange} />
                   Propio
                 </label>
                 <label className="flex items-center gap-2">
                   <input type="radio" name="usage" value="familiar" checked={formData.usage === 'familiar'} onChange={handleChange} />
                   Familiar
                 </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vivienda</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="piso">Piso</option>
                <option value="chalet">Chalet / Casa</option>
                <option value="atico">Ático</option>
                <option value="oficina">Oficina</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>

            <div className="row-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Zonas (Selección Múltiple)</label>
              <select
                multiple
                name="zones"
                value={formData.zones}
                onChange={handleZoneChange}
                className="w-full p-2 border border-gray-300 rounded-md h-48 text-sm"
              >
                {BARCELONA_ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Usa Ctrl+Click para seleccionar varias.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Máx (€)</label>
              <input
                type="number"
                name="maxBudget"
                value={formData.maxBudget}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {/* Fila: Habitaciones y Baños */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                <input
                  type="number"
                  name="minRooms"
                  value={formData.minRooms}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                <input
                  type="number"
                  name="minBathrooms"
                  value={formData.minBathrooms}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Fila: Extras (Colspan 2 en SM, pero en nuestra grid padre que es cols-1/cols-3 esto debe manejarse bien) */}
            {/* La grid padre es grid-cols-1 md:grid-cols-3. 
                Vamos a hacer que los extras ocupen una fila entera o compartida. 
                Mejor poner los extras en una sub-grid de 4 columnas que ocupe ancho completo si es posible.
                Pero estamos dentro de una celda de la grid padre? No, estamos en el flujo principal de children del grid padre.
                El padre es: <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            */}
            
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Parking</label>
                <select
                  name="needParking"
                  value={formData.needParking}
                  onChange={handleChange}
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="indiferente">Indiferente</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Terraza</label>
                <select
                  name="needTerrace"
                  value={formData.needTerrace}
                  onChange={handleChange}
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="indiferente">Indiferente</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Jardín</label>
                <select
                  name="needGarden"
                  value={formData.needGarden}
                  onChange={handleChange}
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="indiferente">Indiferente</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Piscina</label>
                <select
                  name="needPool"
                  value={formData.needPool}
                  onChange={handleChange}
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="indiferente">Indiferente</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-2 border-t mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <LucideSave size={16} />
            {initialData ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerForm;
