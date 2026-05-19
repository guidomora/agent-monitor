# Spec: Polling en sección de Mensajes (WhatsApp)

## Objetivo

Implementar un mecanismo de polling en la sección **Mensajes** para que las conversaciones y mensajes nuevos se actualicen automáticamente sin requerir refresco manual constante.

El polling debe estar **activo solo cuando el usuario está en la sección de mensajes** (`/whatsapp`) y detenerse al salir de esa pantalla.

---

## Contexto actual del proyecto

### Flujo de datos actual

1. `app/whatsapp/page.tsx` renderiza `WhatsAppViewer`.
2. `WhatsAppViewer` consume endpoints internos:
   - `GET /api/conversations`
   - `GET /api/conversations/[conversationId]`
3. Los route handlers delegan en `features/whatsapp/services/conversations.service.ts`.
4. `conversations.service.ts` consulta Twilio directamente (`messages.list`) y mapea a modelos UI.

### Problema actual

- El listado de conversaciones se carga al montar la vista.
- Los mensajes de un chat se cargan al seleccionar conversación.
- No hay auto-actualización periódica.
- El usuario depende del botón “Recargar” para ver nueva actividad.

---

## Alcance

### Incluye

- Polling de conversaciones mientras la vista `WhatsAppViewer` esté montada.
- Polling de mensajes de la conversación seleccionada.
- Limpieza correcta de timers/controladores al desmontar o cambiar de conversación.
- Mantener comportamiento de errores/loading existente con mínimos cambios.

### No incluye

- WebSockets, SSE o canales en tiempo real.
- Refactor amplio a TanStack Query (si no está ya adoptado en esta feature).
- Cambios de diseño UI grandes.
- Cambios de contratos API backend (no aplica; fuente es Twilio vía API interna Next).

---

## Requisitos funcionales

1. Al entrar a `/whatsapp`, iniciar polling automático.
2. El polling debe refrescar:
   - Conversaciones.
   - Mensajes de la conversación activa (si existe).
3. Al salir de `/whatsapp`, detener polling.
4. No romper la búsqueda local ni la selección de conversación.
5. Seguir permitiendo “Recargar” manual (opcional mantener como fallback UX).

---

## Requisitos no funcionales

1. **Cambio mínimo y seguro** sobre la implementación actual.
2. Evitar requests superpuestas innecesarias.
3. Evitar flicker visual (no mostrar skeletons completos en cada tick).
4. Mantener manejo de errores explícito.
5. Código legible y consistente con patrones actuales del feature.

---

## Diseño propuesto

## Opción recomendada (incremental)

Implementar polling dentro de `features/whatsapp/components/whatsapp-viewer.tsx` reutilizando `readJson` y extrayendo funciones de carga reutilizables.

### Estrategia

1. Extraer funciones:
   - `loadConversations(options?)`
   - `loadMessages(conversationId, options?)`
2. Separar flags de loading:
   - `isLoadingConversationsInitial` (primer render)
   - `isRefreshingConversations` (polling/manual refresh)
   - `isLoadingMessagesInitial`
   - `isRefreshingMessages`
3. Crear `useEffect` de polling con `setInterval`.
4. En cada tick:
   - refrescar conversaciones.
   - si hay `selectedConversationId`, refrescar mensajes de ese chat.
5. Evitar carrera de datos con:
   - `AbortController` por request, o
   - guard de “última ejecución válida”.
6. Cleanup en unmount:
   - `clearInterval`
   - `abort()` de requests en curso.

### Intervalo sugerido

- Default inicial: **10 segundos**.
- Guardarlo como constante local (`POLLING_INTERVAL_MS = 10_000`) para ajuste sencillo.

---

## Comportamiento UX esperado

1. Primera carga:
   - Mantener skeletons actuales.
2. Durante polling:
   - No resetear pantalla a estado “loading completo”.
   - Mostrar, si se desea, estado sutil “actualizando…” (opcional).
3. Errores intermitentes de polling:
   - No vaciar datos ya cargados por defecto.
   - Reportar error no bloqueante (ej. mensaje breve o log).
4. Recargar manual:
   - Puede forzar refresh inmediato y mantener semántica existente.

---

## Consideraciones técnicas clave

1. **Fuente de verdad**
   - Mensajes vienen de Twilio vía API interna Next, no de backend de reservas.
2. **Costo de polling**
   - `listWhatsappMessages` trae lote y luego filtra/mapea; polling agresivo podría aumentar costo.
3. **Escalabilidad**
   - Para alto volumen futuro, considerar cursores/incremental fetch por fecha/SID.
4. **Orden y autoscroll**
   - Actualmente se hace autoscroll en cada cambio de `messages`; con polling podría mover el scroll siempre al fondo.
   - Evaluar si limitar autoscroll solo cuando el usuario ya está cerca del final.
5. **Condiciones de carrera**
   - Si cambia conversación entre ticks, asegurar que respuesta vieja no pise estado nuevo.

---

## Plan de implementación (paso a paso)

1. **Preparación**
   - Revisar `WhatsAppViewer` y localizar cargas iniciales/manuales.
2. **Refactor mínimo interno**
   - Extraer helpers async reutilizables para conversaciones y mensajes.
3. **Incorporar polling**
   - Añadir `useEffect` con `setInterval` y cleanup.
4. **Evitar sobreescrituras inválidas**
   - Asegurar control de abort/cancel por tick y por conversación activa.
5. **Ajustar indicadores de carga**
   - Diferenciar primera carga vs refresh periódico.
6. **Verificación funcional local**
   - Entrar/salir de `/whatsapp` y validar inicio/parada del polling.
   - Verificar actualización automática de nuevos mensajes.
7. **Revisión de regresiones**
   - Búsqueda, selección de chat, botón recargar, estados error/empty.

---

## Riesgos y mitigaciones

1. **Demasiadas llamadas a API/Twilio**
   - Mitigación: intervalo moderado (10s), evitar solapamiento.
2. **Parpadeo por loading repetitivo**
   - Mitigación: no activar loading global en cada tick.
3. **Scroll molesto**
   - Mitigación: condicionar autoscroll al contexto del usuario.
4. **Errores temporales de red**
   - Mitigación: no limpiar estado exitoso previo en fallos de polling.

---

## Criterios de aceptación

1. Al abrir `/whatsapp`, las conversaciones se refrescan automáticamente cada ~10s.
2. Con un chat seleccionado, los mensajes de ese chat también se refrescan automáticamente.
3. Al navegar fuera de `/whatsapp`, se detienen intervalos y requests asociadas.
4. No se pierde funcionalidad existente de búsqueda, selección y recarga manual.
5. No hay errores de React por updates sobre componente desmontado.
6. La UI no entra en estado de skeleton completo en cada ciclo de polling.

---

## Plan de pruebas

### Manuales

1. Abrir `/whatsapp` con DevTools Network:
   - validar requests periódicos a `/api/conversations`.
2. Seleccionar conversación:
   - validar requests periódicos a `/api/conversations/[id]`.
3. Cambiar de ruta:
   - validar que cesan requests periódicos.
4. Simular error de red:
   - validar que no se borra el último estado válido.
5. Usar búsqueda y recargar manual:
   - validar que comportamiento se mantiene.

### Técnicas (si aplica)

- Unit test de helpers de carga (mock fetch).
- Test de hook/componente con fake timers para verificar `setInterval/clearInterval`.

---

## Posibles mejoras futuras (fuera de alcance)

1. Migrar server state de esta feature a TanStack Query con `refetchInterval`.
2. Polling adaptativo (más rápido en chat activo, más lento inactivo).
3. Modo “pause polling” cuando pestaña no está visible (`document.visibilityState`).
4. Evolucionar a push real-time (webhooks + socket/SSE).

---

## Checklist de implementación

- [ ] Crear constante `POLLING_INTERVAL_MS`.
- [ ] Extraer funciones reutilizables de fetch para conversaciones/mensajes.
- [ ] Incorporar `useEffect` de polling con cleanup.
- [ ] Evitar race conditions al cambiar conversación.
- [ ] Mantener estados UX actuales sin flicker.
- [ ] Verificar botón recargar y búsqueda.
- [ ] Validar en navegación que polling se detiene.
