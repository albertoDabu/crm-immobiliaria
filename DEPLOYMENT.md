# Guía de Despliegue - CRM Inmobiliaria a Producción

Esta guía te llevará paso a paso para desplegar tu aplicación en Cloudflare Pages + Workers + Supabase.

---

## 📋 Pre-requisitos

1. **Cuenta de Supabase** - [supabase.com](https://supabase.com) (Free tier)
2. **Cuenta de Cloudflare** - [cloudflare.com](https://cloudflare.com) (Free tier)
3. **Node.js** instalado (v18+)
4. **Git** instalado y configurado

---

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Click en "New Project"
3. Completa:
   - **Name**: `crm-immobiliaria`
   - **Database Password**: (guarda esto en un lugar seguro)
   - **Region**: Frankfurt (más cercano a España)
4. Espera 2-3 minutos a que se cree el proyecto

### 1.2 Ejecutar Script SQL

1. En el panel de Supabase, ve a **SQL Editor** (icono en sidebar)
2. Click en **New Query**
3. Copia todo el contenido de `supabase/schema.sql`
4. Pega en el editor
5. Click en **Run** (▶️)
6. Verifica que se crearon las tablas en **Table Editor**

### 1.3 Obtener Credenciales

1. Ve a **Project Settings** ⚙️ → **API**
2. Guarda estos valores (los necesitarás después):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...` (clave pública)
   - **service_role**: `eyJhbGci...` (clave privada, ¡NUNCA la expongas!)

### 1.4 Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Email** está habilitado
3. (Opcional) Desactiva la confirmación de email:
   - Ve a **Authentication** → **Policies**
   - Desactiva "Enable email confirmations" si quieres testing rápido

---

## ⚡ Paso 2: Configurar Cloudflare Worker

### 2.1 Instalar Wrangler CLI

**Opción 1: Instalar localmente (Recomendado - evita problemas de permisos)**

```powershell
# Desde la carpeta del proyecto
npm install wrangler --save-dev
```

Luego usa `npx wrangler` en lugar de `wrangler` en todos los comandos.

**Opción 2: Solucionar permisos de PowerShell**

Si prefieres instalación global, ejecuta PowerShell **como Administrador** y ejecuta:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Luego instala wrangler:

```powershell
npm install -g wrangler
```

**Opción 3: Usar CMD en lugar de PowerShell**

Abre **Símbolo del sistema (CMD)** y ejecuta:

```cmd
npm install -g wrangler
```

### 2.2 Login en Cloudflare

```powershell
# Si instalaste globalmente:
wrangler login

# Si instalaste localmente:
npx wrangler login
```

Se abrirá tu navegador para autorizar.

### 2.3 Instalar Dependencias del Worker

```cmd
cd c:\Users\alber\Proyectos\CRM immobiliaria
npm install @supabase/supabase-js
```

### 2.4 Configurar Variables de Entorno

```cmd
REM Setear SUPABASE_URL (usa npx si instalaste localmente)
npx wrangler secret put SUPABASE_URL
REM Pega: https://xxxxx.supabase.co

REM Setear SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
REM Pega la clave service_role de Supabase
```

### 2.5 Desplegar Worker

```cmd
REM Desarrollo local
npx wrangler dev worker/index.js

REM Deploy a producción
npx wrangler deploy
```

Guarda la URL del worker que te aparece (ej: `https://crm-immobiliaria-api.tu-usuario.workers.dev`)

---

## 🎨 Paso 3: Configurar Frontend (Cloudflare Pages)

### 3.1 Crear Archivo `.env`

En la raíz del proyecto:

```cmd
copy .env.example .env
```

Edita `.env` y completa:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=https://crm-immobiliaria-api.tu-usuario.workers.dev
```

### 3.2 Inicializar Git (si no lo tienes)

```cmd
git init
git add .
git commit -m "Initial commit - CRM production ready"
```

### 3.3 Subir a GitHub

1. Crea un nuevo repositorio en [github.com/new](https://github.com/new)
2. **No** marques "Initialize with README"
3. Copia los comandos que GitHub te da:

```cmd
git remote add origin https://github.com/tu-usuario/crm-immobiliaria.git
git branch -M main
git push -u origin main
```

### 3.4 Conectar Cloudflare Pages

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click en **Workers & Pages** → **Create Application** → **Pages**
3. Click **Connect to Git**
4. Autoriza GitHub y selecciona tu repositorio
5. Configura el build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. En **Environment Variables**, añade:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   VITE_API_URL=https://crm-immobiliaria-api.tu-usuario.workers.dev
   ```
7. Click **Save and Deploy**

Espera 2-3 minutos. ¡Tu app estará en `https://crm-immobiliaria.pages.dev`!

---

## 🔧 Paso 4: Configurar CORS en Worker

### 4.1 Actualizar CORS Origin

Edita `worker/index.js` línea 10:

```javascript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://crm-immobiliaria.pages.dev", // Tu dominio de Pages
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

### 4.2 Re-desplegar Worker

```cmd
npx wrangler deploy
```

---

## 🧪 Paso 5: Testing

### 5.1 Crear Usuario de Prueba

1. Ve a `https://crm-immobiliaria.pages.dev`
2. Click en "¿No tienes cuenta? Regístrate"
3. Usa tu email y crea una contraseña
4. Si desactivaste confirmación de email, podrás acceder directamente
5. Si está activa, revisa tu email y confirma

### 5.2 Probar el CRM

- Crea un contacto
- Edita datos
- Añade historial de contacto
- Prueba el matching

---

## 📦 Paso 6: Migrar Datos Locales a Producción

### 6.1 Exportar desde Local

Usa el botón "Exportar" en tu versión local para descargar `crm-backup.json`

### 6.2 Crear Script de Migración

Crea `scripts/migrate-data.js`:

```javascript
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_KEY = "tu-anon-key";
const USER_ID = "tu-user-id"; // Lo obtienes de Supabase Auth

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const data = JSON.parse(fs.readFileSync("crm-backup.json", "utf-8"));

for (const buyer of data) {
  // Insertar contacto
  const { data: contact } = await supabase
    .from("contacts")
    .insert({
      user_id: USER_ID,
      name: buyer.name,
      phone: buyer.phone,
      // ... mapear todos los campos
    })
    .select()
    .single();

  // Insertar historial
  if (buyer.contactHistory) {
    for (const history of buyer.contactHistory) {
      await supabase.from("contact_history").insert({
        contact_id: contact.id,
        date: history.date,
        note: history.note,
        type: history.type,
      });
    }
  }
}

console.log("Migración completada!");
```

Ejecuta:

```cmd
node scripts/migrate-data.js
```

---

## 🎯 Paso 7: Comandos Útiles

### Desarrollo Local

```cmd
REM Frontend (localhost:5173)
npm run dev

REM Worker (localhost:8787) - usa npx si instalaste localmente
npx wrangler dev worker/index.js
```

### Despliegue

```cmd
REM Re-desplegar Worker
npx wrangler deploy

REM Pages se despliega automáticamente con git push
git add .
git commit -m "Update"
git push
```

### Ver Logs

```cmd
REM Logs del Worker en tiempo real
npx wrangler tail
```

---

## 🔒 Seguridad - Checklist Final

- [ ] CORS configurado solo para tu dominio (no `*`)
- [ ] `service_role` key **NUNCA** expuesta en frontend
- [ ] RLS (Row Level Security) habilitado en Supabase
- [ ] Variables de entorno correctamente configuradas
- [ ] Confirmación de email activada en producción

---

## 🆘 Troubleshooting

### Error: "Missing Authorization header"

- Verifica que estás logueado
- Comprueba que el token se envía en las peticiones (DevTools → Network)

### Error: "CORS policy"

- Actualiza `corsHeaders` en `worker/index.js`
- Re-despliega el worker

### Error: "Invalid JWT"

- Token expirado, cierra sesión y vuelve a entrar
- Verifica `VITE_SUPABASE_ANON_KEY`

### Los datos no se guardan

- Verifica que el Worker está desplegado
- Comprueba `VITE_API_URL` en las variables de Pages
- Revisa logs con `wrangler tail`

---

## 📞 Soporte

- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **Cloudflare Pages**: https://developers.cloudflare.com/pages

---

¡Listo! Tu CRM está en producción 🚀
