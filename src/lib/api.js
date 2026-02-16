import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

// Helper para obtener el token JWT actual
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

// Helper para hacer peticiones con autenticación
async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token available')
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// =============================================
// API Methods
// =============================================

export const api = {
  // Contacts
  async getContacts() {
    const data = await apiRequest('/api/contacts')
    return data.contacts
  },

  async getContact(id) {
    const data = await apiRequest(`/api/contacts/${id}`)
    return data.contact
  },

  async createContact(contact) {
    const data = await apiRequest('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    })
    return data.contact
  },

  async updateContact(id, contact) {
    await apiRequest(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    })
  },

  async deleteContact(id) {
    await apiRequest(`/api/contacts/${id}`, {
      method: 'DELETE',
    })
  },

  // Contact History
  async addContactHistory(contactId, entry) {
    const data = await apiRequest(`/api/contacts/${contactId}/history`, {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    return data.history
  },

  async updateContactHistory(contactId, historyId, entry) {
    await apiRequest(`/api/contacts/${contactId}/history/${historyId}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
  },

  async deleteContactHistory(contactId, historyId) {
    await apiRequest(`/api/contacts/${contactId}/history/${historyId}`, {
      method: 'DELETE',
    })
  },

  // Bulk Operations
  async bulkContact(contactIds, message, channel = 'whatsapp') {
    const data = await apiRequest('/api/contacts/bulk-contact', {
      method: 'POST',
      body: JSON.stringify({ contactIds, message, channel }),
    })
    return data
  },
}
