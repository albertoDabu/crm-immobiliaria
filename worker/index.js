// =============================================
// CRM Inmobiliaria - Cloudflare Worker API
// =============================================

import { createClient } from '@supabase/supabase-js'

// =============================================
// CORS Headers
// =============================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En producción, cambiar a tu dominio de Pages
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// =============================================
// Helper: Respuesta con CORS
// =============================================
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

// =============================================
// Middleware: Validar JWT de Supabase
// =============================================
async function validateAuth(request, supabase) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', user: null }
  }

  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return { error: 'Invalid or expired token', user: null }
  }

  return { user, error: null }
}

// =============================================
// HANDLERS DE ENDPOINTS
// =============================================

// GET /api/contacts - Listar todos los contactos del usuario
async function getContacts(request, env, user) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      secondary_contacts (*),
      contact_history (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  // Transformar datos al formato del frontend
  const contacts = data.map(contact => ({
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    phone2: contact.phone2,
    email: contact.email,
    managementType: contact.management_type,
    type: contact.type,
    zones: contact.zones || [],
    zone: contact.zones?.join(', ') || '', // Retrocompatibilidad
    minBudget: contact.min_budget,
    maxBudget: contact.max_budget,
    minRooms: contact.min_rooms,
    minBathrooms: contact.min_bathrooms,
    needParking: contact.need_parking,
    needTerrace: contact.need_terrace,
    needGarden: contact.need_garden,
    needPool: contact.need_pool,
    urgency: contact.urgency,
    intent: contact.intent,
    usage: contact.usage,
    language: contact.language,
    notes: contact.notes,
    lastContact: contact.last_contact,
    registrationDate: contact.registration_date,
    contact2: contact.secondary_contacts?.[0] || { name: '', phone: '', email: '', relation: '' },
    contactHistory: (contact.contact_history || []).map(h => ({
      date: h.date,
      note: h.note,
      channel: h.channel,
      feedback: h.feedback,
      type: h.type,
      id: h.id,
    })),
  }))

  return jsonResponse({ contacts })
}

// GET /api/contacts/:id - Obtener un contacto específico
async function getContact(request, env, user, contactId) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      secondary_contacts (*),
      contact_history (*)
    `)
    .eq('id', contactId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return jsonResponse({ error: 'Contact not found' }, 404)
  }

  // Transformar al formato del frontend (igual que en getContacts)
  const contact = {
    id: data.id,
    name: data.name,
    phone: data.phone,
    phone2: data.phone2,
    email: data.email,
    managementType: data.management_type,
    type: data.type,
    zones: data.zones || [],
    minBudget: data.min_budget,
    maxBudget: data.max_budget,
    minRooms: data.min_rooms,
    minBathrooms: data.min_bathrooms,
    needParking: data.need_parking,
    needTerrace: data.need_terrace,
    needGarden: data.need_garden,
    needPool: data.need_pool,
    urgency: data.urgency,
    intent: data.intent,
    usage: data.usage,
    language: data.language,
    notes: data.notes,
    lastContact: data.last_contact,
    registrationDate: data.registration_date,
    contact2: data.secondary_contacts?.[0] || {},
    contactHistory: data.contact_history || [],
  }

  return jsonResponse({ contact })
}

// POST /api/contacts - Crear nuevo contacto
async function createContact(request, env, user) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const body = await request.json()

  // Insertar contacto principal
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert({
      user_id: user.id,
      name: body.name,
      phone: body.phone,
      phone2: body.phone2,
      email: body.email,
      management_type: body.managementType,
      type: body.type,
      zones: body.zones || [],
      min_budget: body.minBudget || 0,
      max_budget: body.maxBudget || 0,
      min_rooms: body.minRooms || 0,
      min_bathrooms: body.minBathrooms || 0,
      need_parking: body.needParking || 'indiferente',
      need_terrace: body.needTerrace || 'indiferente',
      need_garden: body.needGarden || 'indiferente',
      need_pool: body.needPool || 'indiferente',
      urgency: body.urgency || 'media',
      intent: body.intent || 'vivir',
      usage: body.usage || 'propio',
      language: body.language || 'es',
      notes: body.notes || '',
      registration_date: body.registrationDate || new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (contactError) {
    return jsonResponse({ error: contactError.message }, 500)
  }

  // Insertar contacto secundario si existe
  if (body.contact2 && body.contact2.name) {
    await supabase.from('secondary_contacts').insert({
      contact_id: contact.id,
      name: body.contact2.name,
      phone: body.contact2.phone,
      email: body.contact2.email,
      relation: body.contact2.relation,
    })
  }

  return jsonResponse({ contact: { ...body, id: contact.id } }, 201)
}

// PUT /api/contacts/:id - Actualizar contacto
async function updateContact(request, env, user, contactId) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const body = await request.json()

  // Actualizar contacto principal
  const { error: contactError } = await supabase
    .from('contacts')
    .update({
      name: body.name,
      phone: body.phone,
      phone2: body.phone2,
      email: body.email,
      management_type: body.managementType,
      type: body.type,
      zones: body.zones || [],
      min_budget: body.minBudget || 0,
      max_budget: body.maxBudget || 0,
      min_rooms: body.minRooms || 0,
      min_bathrooms: body.minBathrooms || 0,
      need_parking: body.needParking,
      need_terrace: body.needTerrace,
      need_garden: body.needGarden,
      need_pool: body.needPool,
      urgency: body.urgency,
      intent: body.intent,
      usage: body.usage,
      language: body.language,
      notes: body.notes,
      registration_date: body.registrationDate,
    })
    .eq('id', contactId)
    .eq('user_id', user.id)

  if (contactError) {
    return jsonResponse({ error: contactError.message }, 500)
  }

  // Actualizar/crear contacto secundario
  if (body.contact2) {
    // Intentar actualizar primero
    const { error: updateError } = await supabase
      .from('secondary_contacts')
      .update({
        name: body.contact2.name,
        phone: body.contact2.phone,
        email: body.contact2.email,
        relation: body.contact2.relation,
      })
      .eq('contact_id', contactId)

    // Si no existe, crear
    if (updateError && body.contact2.name) {
      await supabase.from('secondary_contacts').insert({
        contact_id: contactId,
        name: body.contact2.name,
        phone: body.contact2.phone,
        email: body.contact2.email,
        relation: body.contact2.relation,
      })
    }
  }

  return jsonResponse({ success: true })
}

// DELETE /api/contacts/:id - Eliminar contacto
async function deleteContact(request, env, user, contactId) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', user.id)

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  return jsonResponse({ success: true })
}

// POST /api/contacts/:id/history - Añadir entrada al historial
async function addContactHistory(request, env, user, contactId) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const body = await request.json()

  // Verificar que el contacto pertenece al usuario
  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', contactId)
    .eq('user_id', user.id)
    .single()

  if (!contact) {
    return jsonResponse({ error: 'Contact not found' }, 404)
  }

  const { data, error } = await supabase
    .from('contact_history')
    .insert({
      contact_id: contactId,
      date: body.date || new Date().toISOString(),
      note: body.note,
      channel: body.channel,
      feedback: body.feedback,
      type: body.type || 'manual',
    })
    .select()
    .single()

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  return jsonResponse({ history: data }, 201)
}

// PUT /api/contacts/:id/history/:historyId - Editar historial
async function updateContactHistory(request, env, user, contactId, historyId) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const body = await request.json()

  // Verificar que el contacto pertenece al usuario
  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', contactId)
    .eq('user_id', user.id)
    .single()

  if (!contact) {
    return jsonResponse({ error: 'Contact not found' }, 404)
  }

  const { error } = await supabase
    .from('contact_history')
    .update({
      note: body.note,
      channel: body.channel,
      feedback: body.feedback,
    })
    .eq('id', historyId)
    .eq('contact_id', contactId)

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  return jsonResponse({ success: true })
}

// DELETE /api/contacts/:id/history/:historyId - Eliminar historial
async function deleteContactHistory(request, env, user, contactId, historyId) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  // Verificar que el contacto pertenece al usuario
  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', contactId)
    .eq('user_id', user.id)
    .single()

  if (!contact) {
    return jsonResponse({ error: 'Contact not found' }, 404)
  }

  const { error } = await supabase
    .from('contact_history')
    .delete()
    .eq('id', historyId)
    .eq('contact_id', contactId)

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  return jsonResponse({ success: true })
}

// POST /api/contacts/bulk-contact - Contacto masivo (matching)
async function bulkContact(request, env, user) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const body = await request.json()
  const { contactIds, message, channel } = body

  const now = new Date().toISOString()

  // Insertar historial para múltiples contactos
  const historyEntries = contactIds.map(contactId => ({
    contact_id: contactId,
    date: now,
    note: message,
    channel: channel || 'whatsapp',
    type: 'simulation',
  }))

  const { error } = await supabase
    .from('contact_history')
    .insert(historyEntries)

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  return jsonResponse({ success: true, contacted: contactIds.length })
}

// =============================================
// ROUTER PRINCIPAL
// =============================================
export default {
  async fetch(request, env, ctx) {
    // Manejar preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // Crear cliente Supabase para validación de auth
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

    // Validar autenticación
    const { user, error: authError } = await validateAuth(request, supabase)
    if (authError) {
      return jsonResponse({ error: authError }, 401)
    }

    // Routing
    try {
      // GET /api/contacts
      if (path === '/api/contacts' && request.method === 'GET') {
        return await getContacts(request, env, user)
      }

      // GET /api/contacts/:id
      if (path.match(/^\/api\/contacts\/[^/]+$/) && request.method === 'GET') {
        const contactId = path.split('/').pop()
        return await getContact(request, env, user, contactId)
      }

      // POST /api/contacts
      if (path === '/api/contacts' && request.method === 'POST') {
        return await createContact(request, env, user)
      }

      // PUT /api/contacts/:id
      if (path.match(/^\/api\/contacts\/[^/]+$/) && request.method === 'PUT') {
        const contactId = path.split('/').pop()
        return await updateContact(request, env, user, contactId)
      }

      // DELETE /api/contacts/:id
      if (path.match(/^\/api\/contacts\/[^/]+$/) && request.method === 'DELETE') {
        const contactId = path.split('/').pop()
        return await deleteContact(request, env, user, contactId)
      }

      // POST /api/contacts/:id/history
      if (path.match(/^\/api\/contacts\/[^/]+\/history$/) && request.method === 'POST') {
        const contactId = path.split('/')[3]
        return await addContactHistory(request, env, user, contactId)
      }

      // PUT /api/contacts/:id/history/:historyId
      if (path.match(/^\/api\/contacts\/[^/]+\/history\/[^/]+$/) && request.method === 'PUT') {
        const parts = path.split('/')
        const contactId = parts[3]
        const historyId = parts[5]
        return await updateContactHistory(request, env, user, contactId, historyId)
      }

      // DELETE /api/contacts/:id/history/:historyId
      if (path.match(/^\/api\/contacts\/[^/]+\/history\/[^/]+$/) && request.method === 'DELETE') {
        const parts = path.split('/')
        const contactId = parts[3]
        const historyId = parts[5]
        return await deleteContactHistory(request, env, user, contactId, historyId)
      }

      // POST /api/contacts/bulk-contact
      if (path === '/api/contacts/bulk-contact' && request.method === 'POST') {
        return await bulkContact(request, env, user)
      }

      // Ruta no encontrada
      return jsonResponse({ error: 'Not found' }, 404)

    } catch (error) {
      console.error('Worker error:', error)
      return jsonResponse({ error: 'Internal server error', details: error.message }, 500)
    }
  },
}
