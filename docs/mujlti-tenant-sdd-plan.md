# Multi-Tenant Dashboard Spec

## Objetivo

Convertir este dashboard de reservas en una aplicacion reutilizable para multiples clientes sin crear un repo, deploy o frontend distinto por cliente.

El resultado esperado es:

- Un unico frontend Next.js.
- Un unico deploy del dashboard.
- Usuarios autenticados.
- Cada usuario asociado a uno o mas clientes, tambien llamados tenants.
- Cada request resuelve automaticamente que backend, Twilio account y configuracion corresponde al usuario autenticado.
- Los secretos de cada cliente permanecen en servidor y nunca llegan al browser.

## Estado actual del repo

Hoy la aplicacion esta preparada para un solo cliente por deploy.

Puntos relevantes:

- `app/api/*` ya funciona como backend-for-frontend: el browser llama al propio Next.js y Next llama al backend real o a Twilio.
- `features/reservations/api/reservations.client.ts` llama a endpoints relativos como `/api/reservations`.
- `features/reservations/api/reservations.service.ts` llama al backend mediante `backendApi`.
- `infrastructure/http/backend-api.ts` crea un singleton de Axios con `baseURL` tomada de variables de entorno.
- `infrastructure/http/backend-env.ts` lee `BACKEND_API_BASE_URL` e `INTERNAL_API_TOKEN` desde `process.env`.
- `infrastructure/twilio/twilio-env.ts` lee `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` y `TWILIO_MESSAGE_LIMIT` desde `process.env`.
- `infrastructure/twilio/twilio-client.ts` cachea un unico cliente Twilio global.
- No hay auth, sesion, users, tenants ni permisos.

Conclusion: el browser esta desacoplado del backend real, lo cual es bueno. Pero el servidor Next.js todavia usa configuracion global de proceso, por lo que un deploy representa un unico cliente.

## Decision recomendada

Para una primera version, usar el propio server de Next.js de este repo.

No crear un backend Nest separado todavia, salvo que la logica de plataforma crezca mucho.

Motivos:

- Ya existen Route Handlers en `app/api/*`.
- Ya existe un patron donde el browser no llama al backend real directamente.
- Permite avanzar con un solo repo y un solo deploy.
- Reduce complejidad inicial.
- Mantiene el cambio cerca del problema actual.

La arquitectura inicial recomendada es:

```txt
Browser
  -> Next.js pages/components
  -> Next.js Route Handlers (/api/*)
  -> resolve session
  -> resolve tenant
  -> load tenant config/secrets server-side
  -> call tenant backend or Twilio
```

Mas adelante, si el dashboard se convierte en una plataforma mas grande, se puede extraer la capa de auth/tenancy/proxy a un backend Nest:

```txt
Browser
  -> Next.js frontend
  -> Nest platform API
  -> tenant backend / Twilio
```

## Conceptos principales

### User

Persona que inicia sesion en el dashboard.

Campos minimos:

```txt
id
email
name
password_hash or external_auth_provider_id
created_at
updated_at
```

### Tenant

Cliente operativo del sistema.

Ejemplos:

- Restaurante A.
- Hotel B.
- Barberia C.

Campos minimos:

```txt
id
slug
name
status
timezone
backend_base_url
created_at
updated_at
```

### Tenant membership

Relacion entre usuario y tenant.

Campos minimos:

```txt
id
user_id
tenant_id
role
created_at
updated_at
```

Roles iniciales sugeridos:

```txt
owner
admin
operator
viewer
```

### Tenant secrets

Secretos necesarios para llamar al backend operativo o Twilio.

No deben exponerse al browser.

Secretos iniciales:

```txt
tenant_id
internal_api_token
twilio_account_sid
twilio_auth_token
twilio_whatsapp_number
twilio_message_limit
```

## Manejo de secretos

No guardar variables de entorno por usuario como texto plano en la DB.

Modelo recomendado:

- Guardar configuracion no sensible en DB central.
- Guardar secretos en un secret manager si la infraestructura lo permite.
- Si se guardan secretos en DB al inicio, guardarlos cifrados a nivel aplicacion.
- Mantener una unica `APP_ENCRYPTION_KEY` o equivalente en variables de entorno del deploy.
- Nunca enviar secretos al browser.
- Nunca permitir que el usuario envie `tenantId` libremente para elegir backend.

Ejemplo:

```txt
DB tenants:
  id = tenant_123
  name = "Cliente Demo"
  backend_base_url = "https://api.cliente-demo.com"

DB tenant_secrets or secret manager:
  tenant_id = tenant_123
  internal_api_token = encrypted(...)
  twilio_auth_token = encrypted(...)
```

## Resolucion de tenant por request

Cada request protegida debe seguir este flujo:

```txt
1. Leer sesion del usuario.
2. Si no hay sesion, devolver 401 o redirigir a login.
3. Obtener memberships del usuario.
4. Resolver tenant activo.
5. Cargar configuracion del tenant.
6. Crear clientes backend/Twilio para ese tenant.
7. Ejecutar la operacion.
```

Para un usuario con un solo tenant:

```txt
session.userId -> membership -> tenantId
```

Para un usuario con multiples tenants:

```txt
session.userId -> allowed tenants
selectedTenantId from signed cookie or URL segment
validate selectedTenantId belongs to user
```

No confiar en un header o query param editable sin validarlo contra la sesion.

## Estrategia de URL

Opcion simple para empezar:

```txt
/
/gestion
/whatsapp
```

El tenant se guarda en sesion/cookie firmada cuando el usuario inicia sesion o elige cliente.

Opcion mas explicita si habra usuarios multi-cliente:

```txt
/t/[tenantSlug]
/t/[tenantSlug]/gestion
/t/[tenantSlug]/whatsapp
```

Ventajas de URL con tenant:

- Es mas claro para usuarios con multiples clientes.
- Facilita compartir links internos.
- Evita ambiguedad en dashboards multi-cliente.

Recomendacion:

- Si la mayoria de usuarios tendra un solo cliente, usar cookie/sesion.
- Si se espera que usuarios administren varios clientes, usar `/t/[tenantSlug]`.

## Cambios de arquitectura en este repo

### Nueva capa `infrastructure/auth`

Responsabilidad:

- Login/logout.
- Lectura de sesion server-side.
- Proteccion de Route Handlers y paginas.

Archivos sugeridos:

```txt
infrastructure/auth/session.ts
infrastructure/auth/auth-errors.ts
infrastructure/auth/passwords.ts
```

### Nueva capa `infrastructure/tenancy`

Responsabilidad:

- Resolver tenant actual desde la sesion.
- Cargar configuracion del tenant.
- Validar membership.
- Entregar un `TenantContext` server-side.

Archivos sugeridos:

```txt
infrastructure/tenancy/tenant-context.ts
infrastructure/tenancy/tenant-config.repository.ts
infrastructure/tenancy/tenant.types.ts
infrastructure/tenancy/tenant-errors.ts
```

Tipo sugerido:

```ts
export type TenantContext = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  timezone: string;
  backend: {
    baseUrl: string;
    internalApiToken: string | null;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
    messageLimit: number;
  };
};
```

### Refactor de backend HTTP

Cambiar `backendApi` singleton por factory.

Estado actual:

```ts
export const backendApi = axios.create({
  baseURL: getBackendApiBaseUrl(),
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});
```

Objetivo:

```ts
export function createBackendApi(tenant: TenantContext) {
  const client = axios.create({
    baseURL: tenant.backend.baseUrl,
    timeout: 10000,
    headers: {
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    if (tenant.backend.internalApiToken) {
      config.headers.set("x-internal-api-token", tenant.backend.internalApiToken);
      config.headers.set("internal-api-token", tenant.backend.internalApiToken);
      config.headers.delete("Authorization");
    }

    return config;
  });

  return client;
}
```

### Refactor de Twilio

Cambiar cliente global por cliente por tenant.

Estado actual:

```ts
let client: ReturnType<typeof twilio> | null = null;
```

Objetivo:

```ts
export function createTwilioClient(tenant: TenantContext) {
  return twilio(tenant.twilio.accountSid, tenant.twilio.authToken);
}
```

Si hace falta cache, usar cache por `tenantId`, no un singleton global.

### Cambios en services

Los services que hoy usan config global deben recibir `TenantContext`.

Ejemplo reservas:

Estado actual:

```ts
export async function getReservationsByDate(date: string) {
  const response = await backendApi.get("bot/reservations", {
    params: { date },
  });

  return response.data;
}
```

Objetivo:

```ts
export async function getReservationsByDate(
  tenant: TenantContext,
  date: string,
) {
  const backendApi = createBackendApi(tenant);
  const response = await backendApi.get("bot/reservations", {
    params: { date },
  });

  return response.data;
}
```

Ejemplo WhatsApp:

Estado actual:

```ts
const env = getTwilioEnv();
const messages = await getTwilioClient().messages.list(...);
```

Objetivo:

```ts
const client = createTwilioClient(tenant);
const messages = await client.messages.list({
  limit: tenant.twilio.messageLimit,
  pageSize: tenant.twilio.messageLimit,
});
```

### Cambios en Route Handlers

Cada Route Handler debe resolver el tenant antes de llamar al service.

Ejemplo:

```ts
export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenantContext();
    const response = await getReservationsByDate(tenant, date);

    return NextResponse.json(response);
  } catch (error) {
    ...
  }
}
```

Esto aplica a:

```txt
app/api/reservations/route.ts
app/api/reservations/available-dates/route.ts
app/api/reservations/slots/route.ts
app/api/reservations/closed-days/[date]/route.ts
app/api/reservations/closed-slots/[date]/route.ts
app/api/reservations/closure-operations/[operationId]/failures/route.ts
app/api/conversations/route.ts
app/api/conversations/[conversationId]/route.ts
```

### Cambios en Server Components

`app/page.tsx` llama directamente a `getReservationsByDate(date)`.

Debe resolver tenant server-side:

```ts
const tenant = await requireTenantContext();
const reservations = await getReservationsByDate(tenant, date);
```

Si no hay sesion, redirigir a login.

## Plan de implementacion por etapas

### Etapa 1: Preparar tenancy sin cambiar comportamiento

Objetivo:

- Introducir tipos y factories por tenant.
- Mantener fallback a envs actuales para no romper el entorno local.

Tareas:

- Crear `infrastructure/tenancy/tenant.types.ts`.
- Crear `infrastructure/tenancy/env-tenant-context.ts`.
- Cambiar `backend-api.ts` para exportar `createBackendApi(tenant)`.
- Mantener compatibilidad temporal con el tenant leido desde env.
- Cambiar `twilio-client.ts` para exportar `createTwilioClient(tenant)`.
- Ajustar services para recibir tenant.
- Ajustar Route Handlers para usar `getEnvTenantContext()` temporalmente.

Criterio de aceptacion:

- La app sigue funcionando para un solo cliente.
- Ya no existe dependencia obligatoria de singletons globales para backend/Twilio.

### Etapa 2: Agregar auth

Objetivo:

- Proteger paginas y endpoints.
- Asociar cada request a un usuario autenticado.

Decisiones pendientes:

- Elegir proveedor: Auth.js/NextAuth, Clerk, Supabase Auth, custom auth.
- Para una app interna/simple, Auth.js o Supabase Auth son opciones razonables.

Tareas:

- Crear pantalla de login.
- Crear sesion server-side.
- Proteger `app/page.tsx`, `app/gestion/page.tsx`, `app/whatsapp/page.tsx`.
- Proteger todos los Route Handlers bajo `app/api/*`.
- Agregar logout.

Criterio de aceptacion:

- Un usuario no autenticado no puede ver paginas operativas ni llamar APIs.

### Etapa 3: Agregar DB central de tenants

Objetivo:

- Guardar usuarios, tenants y memberships.
- Resolver tenant real desde la sesion.

Tablas minimas:

```sql
users (
  id,
  email,
  name,
  created_at,
  updated_at
)

tenants (
  id,
  slug,
  name,
  status,
  timezone,
  backend_base_url,
  created_at,
  updated_at
)

tenant_memberships (
  id,
  user_id,
  tenant_id,
  role,
  created_at,
  updated_at
)
```

Tareas:

- Elegir DB central. Recomendacion: Postgres.
- Crear repositorio `tenant-config.repository.ts`.
- Implementar `requireTenantContext()`.
- Validar que el usuario pertenece al tenant.
- Reemplazar fallback env en Route Handlers por tenant DB.

Criterio de aceptacion:

- Dos usuarios distintos pueden obtener configuraciones de tenant distintas en el mismo deploy.

### Etapa 4: Manejo seguro de secretos

Objetivo:

- Evitar guardar tokens sensibles en texto plano.

Opciones:

- Secret manager administrado por infraestructura.
- DB con secretos cifrados a nivel aplicacion.

Recomendacion inicial si no hay secret manager:

```txt
tenant_secrets (
  tenant_id,
  encrypted_internal_api_token,
  encrypted_twilio_account_sid,
  encrypted_twilio_auth_token,
  encrypted_twilio_whatsapp_number,
  twilio_message_limit,
  created_at,
  updated_at
)
```

La clave de cifrado vive en env:

```txt
APP_ENCRYPTION_KEY=...
```

Tareas:

- Crear util server-only para cifrar/descifrar secretos.
- Crear repositorio para secretos.
- Descifrar secretos solo dentro del servidor.
- No serializar `TenantContext` completo al cliente.
- Agregar logs que no impriman tokens.

Criterio de aceptacion:

- Un dump de DB no expone directamente tokens operativos.
- El browser nunca recibe secretos.

### Etapa 5: Selector de tenant si aplica

Objetivo:

- Permitir que un usuario con multiples clientes elija el cliente activo.

Tareas:

- Crear endpoint server-side para listar tenants permitidos del usuario.
- Crear UI de selector en el layout.
- Guardar tenant activo en cookie firmada o URL `/t/[tenantSlug]`.
- Validar en cada request que el tenant activo pertenece al usuario.

Criterio de aceptacion:

- Un usuario con multiples memberships puede cambiar de cliente sin reloguearse.
- No puede acceder a tenants ajenos cambiando la URL o cookie manualmente.

### Etapa 6: Observabilidad y operacion

Objetivo:

- Poder operar multiples clientes sin perder trazabilidad.

Tareas:

- Loguear `tenantId`, `userId`, endpoint y status en errores server-side.
- Agregar health checks por tenant si hace falta.
- Agregar pantalla/admin interno para ver tenants activos.
- Agregar rotacion manual de tokens.

Criterio de aceptacion:

- Ante un error, se puede saber que tenant y backend fallaron sin exponer secretos.

## Riesgos y mitigaciones

### Riesgo: filtrar datos entre clientes

Mitigacion:

- Resolver tenant siempre desde sesion.
- Validar membership en servidor.
- No aceptar `tenantId` sin validacion.
- Incluir tests de acceso cruzado.

### Riesgo: secretos expuestos

Mitigacion:

- Usar `server-only` en modulos sensibles.
- No usar `NEXT_PUBLIC_*` para secretos.
- No serializar `TenantContext` completo.
- Cifrar secretos si se guardan en DB.

### Riesgo: cache global incorrecta

Mitigacion:

- Eliminar singletons globales actuales.
- Si se cachean clientes, cachear por `tenantId`.
- No cachear `TenantContext` sin invalidacion.

### Riesgo: backend incorrecto por usuario

Mitigacion:

- Tabla `tenant_memberships`.
- Tests donde usuario A no pueda acceder a tenant B.
- Logs con `tenantId`.

## Testing recomendado

Tests unitarios:

- `requireTenantContext()` devuelve tenant correcto para usuario autenticado.
- `requireTenantContext()` rechaza usuario sin membership.
- `createBackendApi(tenant)` usa `tenant.backend.baseUrl`.
- `createBackendApi(tenant)` agrega token interno correcto.
- `createTwilioClient(tenant)` usa credenciales del tenant.

Tests de integracion:

- `/api/reservations` con usuario A llama config A.
- `/api/reservations` con usuario B llama config B.
- Usuario sin sesion recibe 401.
- Usuario sin acceso al tenant recibe 403.

Checks manuales:

- Login.
- Dashboard principal.
- Gestion de reservas.
- WhatsApp viewer.
- Cambio de tenant si existe selector.

## Cuando extraer a Nest

Mantener Next.js mientras:

- Hay un solo frontend.
- La logica de plataforma es acotada.
- El dashboard actua como backend-for-frontend.
- No hay varios consumidores de la misma API de tenancy.

Crear backend Nest separado cuando:

- Hay multiples frontends o integraciones consumiendo tenants.
- Se necesita admin platform robusto.
- Hay auditoria avanzada, billing, rate limits, colas o webhooks.
- La logica de proxy/routing crece mucho.
- Se quiere separar despliegue frontend de plataforma.

## Decision final propuesta

Implementar primero multi-tenancy dentro de Next.js.

Prioridad:

1. Refactor de clientes globales a clientes por tenant.
2. Auth y proteccion server-side.
3. DB central de users/tenants/memberships.
4. Secret management.
5. Selector multi-tenant si hay usuarios con mas de un cliente.
6. Evaluar Nest solo cuando la capa de plataforma empiece a justificar su propio deploy.

Esta ruta mantiene el objetivo original: un solo repo, un solo deploy y capacidad real de atender multiples clientes sin duplicar frontend.
