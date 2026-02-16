# Guía Detallada: Configuración del Worker (Paso 2.3)

## 📍 Dónde Estás

Has completado:

- ✅ Paso 1: Supabase configurado (base de datos creada)
- ✅ Paso 2.1: Wrangler instalado localmente (`npm install wrangler --save-dev`)
- ✅ Paso 2.2: Login en Cloudflare (`npx wrangler login`)

**Ahora estás en Paso 2.3**: Instalar dependencias del Worker

---

## 🎯 Objetivo del Paso 2.3

Instalar la librería `@supabase/supabase-js` que el Worker necesita para conectarse a tu base de datos de Supabase.

---

## 📝 Paso 2.3: Instalar Dependencias del Worker

### ¿Qué hace este comando?

```cmd
npm install @supabase/supabase-js
```

Este comando instala la librería oficial de Supabase para JavaScript. El Worker la necesita para:

- Conectarse a tu base de datos Supabase
- Validar tokens JWT de autenticación
- Hacer queries a las tablas (contacts, contact_history, etc.)

### Ejecuta el comando

Abre **CMD** en la carpeta de tu proyecto y ejecuta:

```cmd
cd c:\Users\alber\Proyectos\CRM immobiliaria
npm install @supabase/supabase-js
```

**Resultado esperado:**

```
added 1 package, and audited 205 packages in 3s
```

---

## 🔧 Paso 2.4: Configurar Variables de Entorno

Ahora necesitas configurar las credenciales de Supabase. Hay **DOS formas** de hacerlo:

### Opción A: Para Desarrollo Local (Recomendado para empezar)

Ya tienes el archivo `.dev.vars` con tus credenciales:

```
SUPABASE_URL=https://ohktumuuiakpiywpmrjs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

✅ **Este archivo ya está listo**. Wrangler lo usará automáticamente cuando hagas `npx wrangler dev`.

### Opción B: Para Producción (Cuando despliegues)

Cuando quieras desplegar a producción, ejecuta:

```cmd
npx wrangler secret put SUPABASE_URL
REM Te pedirá que pegues: https://ohktumuuiakpiywpmrjs.supabase.co

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
REM Te pedirá que pegues: eyJhbGci... (tu service_role key)
```

**Por ahora, NO hagas esto**. Solo lo necesitas cuando despliegues a producción.

---

## 🚀 Paso 2.5: Probar el Worker Localmente

### 1. Inicia el Worker en modo desarrollo

```cmd
npx wrangler dev worker/index.js
```

**Resultado esperado:**

```
⛅️ wrangler 3.x.x
------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### 2. Verifica que funciona

El Worker está corriendo en `http://localhost:8787`. Puedes probarlo:

**Opción 1: Desde el navegador**

- Abre `http://localhost:8787/api/contacts`
- Deberías ver un error de autenticación (es normal, necesitas el token JWT)

**Opción 2: Desde CMD (en otra ventana)**

```cmd
curl http://localhost:8787/api/contacts
```

Deberías ver:

```json
{ "error": "Missing or invalid Authorization header" }
```

✅ **Esto es correcto!** El Worker está funcionando y pidiendo autenticación.

---

## 📂 Estructura de Archivos

Después de estos pasos, deberías tener:

```
CRM immobiliaria/
├── worker/
│   └── index.js          ← Tu API (Cloudflare Worker)
├── src/
│   ├── components/
│   ├── lib/
│   │   ├── supabase.js   ← Cliente Supabase (frontend)
│   │   └── api.js        ← Cliente API (frontend)
│   └── ...
├── .env                  ← Variables para el FRONTEND (Vite)
├── .dev.vars             ← Variables para el WORKER (desarrollo local)
├── wrangler.toml         ← Configuración del Worker
├── package.json
└── node_modules/
    └── @supabase/
        └── supabase-js/  ← ✅ Instalado en este paso
```

---

## 🔍 Diferencia entre `.env` y `.dev.vars`

| Archivo     | Para qué         | Usado por                     |
| ----------- | ---------------- | ----------------------------- |
| `.env`      | Frontend (React) | Vite (`npm run dev`)          |
| `.dev.vars` | Worker (API)     | Wrangler (`npx wrangler dev`) |

**Contenido de `.env`** (Frontend):

```env
VITE_SUPABASE_URL=https://ohktumuuiakpiywpmrjs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (anon key, NO service_role)
VITE_API_URL=http://localhost:8787
```

**Contenido de `.dev.vars`** (Worker):

```env
SUPABASE_URL=https://ohktumuuiakpiywpmrjs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (service_role key)
```

---

## ✅ Checklist del Paso 2.3

- [ ] Ejecutado `npm install @supabase/supabase-js`
- [ ] Verificado que `.dev.vars` existe y tiene las credenciales correctas
- [ ] Ejecutado `npx wrangler dev worker/index.js`
- [ ] Worker corriendo en `http://localhost:8787`
- [ ] Probado endpoint y recibido error de autenticación (correcto)

---

## 🆘 Problemas Comunes

### Error: "Cannot find module '@supabase/supabase-js'"

**Solución:** Ejecuta de nuevo:

```cmd
npm install @supabase/supabase-js
```

### Error: "Missing environment variable SUPABASE_URL"

**Solución:** Verifica que `.dev.vars` existe y tiene el contenido correcto.

### El Worker no inicia

**Solución:** Verifica que `worker/index.js` existe en la ruta correcta.

---

## ➡️ Siguiente Paso

Una vez que el Worker esté corriendo localmente, continúa con:

**Paso 3: Configurar Frontend**

- Actualizar `.env` con la URL del Worker local
- Probar la aplicación completa (Frontend + Worker + Supabase)

---

¿Necesitas ayuda con algún paso específico? 🚀
