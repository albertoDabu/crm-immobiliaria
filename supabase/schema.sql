-- =============================================
-- CRM Inmobiliaria - Supabase Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLA: contacts
-- =============================================
-- Almacena todos los contactos del CRM (compradores, vendedores, inquilinos, arrendadores)
-- Vinculada a auth.users para identificar al agente inmobiliario propietario

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relación con el agente inmobiliario
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos Básicos
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone2 TEXT,
  email TEXT,
  
  -- Tipo de Gestión
  management_type TEXT NOT NULL CHECK (management_type IN ('comprador', 'inquilino', 'propietario_venta', 'propietario_alquiler')),
  
  -- Preferencias de Búsqueda
  type TEXT NOT NULL DEFAULT 'piso' CHECK (type IN ('piso', 'chalet', 'atico', 'oficina', 'terreno')),
  zones TEXT[] DEFAULT '{}', -- Array de zonas de Barcelona
  min_budget INTEGER DEFAULT 0,
  max_budget INTEGER DEFAULT 0,
  min_rooms INTEGER DEFAULT 0,
  min_bathrooms INTEGER DEFAULT 0,
  
  -- Requisitos Adicionales
  need_parking TEXT DEFAULT 'indiferente' CHECK (need_parking IN ('si', 'no', 'indiferente')),
  need_terrace TEXT DEFAULT 'indiferente' CHECK (need_terrace IN ('si', 'no', 'indiferente')),
  need_garden TEXT DEFAULT 'indiferente' CHECK (need_garden IN ('si', 'no', 'indiferente')),
  need_pool TEXT DEFAULT 'indiferente' CHECK (need_pool IN ('si', 'no', 'indiferente')),
  
  -- Clasificación
  urgency TEXT DEFAULT 'media' CHECK (urgency IN ('alta', 'media', 'baja')),
  intent TEXT DEFAULT 'vivir' CHECK (intent IN ('vivir', 'invertir')),
  usage TEXT DEFAULT 'propio' CHECK (usage IN ('propio', 'familiar')),
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'ca', 'en', 'fr')),
  
  -- Notas y Seguimiento
  notes TEXT,
  last_contact TIMESTAMPTZ,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_management_type ON contacts(management_type);
CREATE INDEX idx_contacts_urgency ON contacts(urgency);
CREATE INDEX idx_contacts_last_contact ON contacts(last_contact);
CREATE INDEX idx_contacts_zones ON contacts USING GIN(zones);

-- =============================================
-- 2. TABLA: secondary_contacts
-- =============================================
-- Contacto secundario (pareja, socio, etc.)

CREATE TABLE secondary_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  name TEXT,
  phone TEXT,
  email TEXT,
  relation TEXT, -- Ej: "Pareja", "Socio"
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Un contacto solo puede tener un contacto secundario
  UNIQUE(contact_id)
);

CREATE INDEX idx_secondary_contacts_contact_id ON secondary_contacts(contact_id);

-- =============================================
-- 3. TABLA: contact_history
-- =============================================
-- Historial de comunicaciones con cada contacto

CREATE TABLE contact_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('whatsapp', 'email', 'phone', 'person')),
  feedback TEXT,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'whatsapp_simulation', 'simulation')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_history_contact_id ON contact_history(contact_id);
CREATE INDEX idx_contact_history_date ON contact_history(date DESC);

-- =============================================
-- 4. FUNCIÓN: Actualizar `updated_at` automáticamente
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar `updated_at`
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secondary_contacts_updated_at
  BEFORE UPDATE ON secondary_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. FUNCIÓN: Actualizar `last_contact` automáticamente
-- =============================================

CREATE OR REPLACE FUNCTION update_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET last_contact = NEW.date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_last_contact
  AFTER INSERT ON contact_history
  FOR EACH ROW
  EXECUTE FUNCTION update_last_contact();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================
-- Cada agente solo puede ver sus propios contactos

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propios contactos
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Secondary contacts vinculados a contactos propios
CREATE POLICY "Users can manage secondary contacts of their contacts"
  ON secondary_contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = secondary_contacts.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Policy: Contact history vinculado a contactos propios
CREATE POLICY "Users can manage contact history of their contacts"
  ON contact_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = contact_history.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- =============================================
-- FIN DEL SCHEMA
-- =============================================

-- Para ejecutar este script en Supabase:
-- 1. Ve a SQL Editor en tu proyecto Supabase
-- 2. Copia y pega este script completo
-- 3. Ejecuta con "Run"
-- 4. Verifica que las tablas se crearon correctamente en Table Editor
