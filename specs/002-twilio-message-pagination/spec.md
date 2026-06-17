# Feature Specification: Twilio Message Pagination

**Feature Branch**: `feat/twilio-pagination`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Implementar una paginacion de mensajes usando la paginacion que ya trae Twilio para que, a medida que el agente tenga mas conversaciones y mensajes, el tiempo de carga en la app no sea lento y la cantidad de datos este optimizada."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar conversaciones recientes rapidamente (Priority: P1)

Como empleado del restaurante, quiero que la seccion WhatsApp - Mensajes cargue solo las conversaciones recientes necesarias inicialmente para poder empezar a trabajar rapido aunque existan muchas conversaciones historicas.

**Why this priority**: La pantalla de mensajes es operativa. Si el agente acumula muchas conversaciones, cargar y procesar todos los mensajes recientes en cada apertura vuelve lenta la experiencia.

**Independent Test**: Puede probarse abriendo la seccion de WhatsApp con un limite inicial configurado y verificando que la respuesta inicial devuelva un lote acotado de conversaciones, junto con una forma de cargar mas.

**Acceptance Scenarios**:

1. **Given** existen mas conversaciones que el tamano del lote inicial, **When** el empleado abre WhatsApp - Mensajes, **Then** la app muestra un primer lote acotado de conversaciones recientes y ofrece cargar mas.
2. **Given** el empleado solicita mas conversaciones, **When** hay mas datos disponibles en Twilio, **Then** la app agrega el siguiente lote sin reemplazar ni duplicar conversaciones ya cargadas.
3. **Given** no hay mas conversaciones disponibles dentro del alcance consultado, **When** el empleado intenta continuar, **Then** la UI deja claro que no hay mas conversaciones para cargar.

---

### User Story 2 - Cargar mensajes de un chat por lotes (Priority: P1)

Como empleado del restaurante, quiero abrir un chat y cargar inicialmente solo los mensajes mas recientes, con opcion de ver mensajes anteriores si los necesito.

**Why this priority**: Los chats con mucho historial no deben bloquear la apertura de la conversacion ni enviar al navegador mas datos de los necesarios.

**Independent Test**: Puede probarse seleccionando una conversacion con historial largo y verificando que la primera carga devuelva un lote reciente, y que cargar anteriores agregue mensajes mas antiguos manteniendo el orden del chat.

**Acceptance Scenarios**:

1. **Given** una conversacion tiene mas mensajes que el lote inicial, **When** el empleado abre la conversacion, **Then** ve los mensajes recientes rapidamente.
2. **Given** el empleado necesita contexto anterior, **When** solicita cargar mensajes anteriores, **Then** la app agrega el lote anterior al inicio del historial visible.
3. **Given** Twilio no devuelve mas mensajes para esa conversacion, **When** el empleado llega al inicio del historial disponible, **Then** la app deja de ofrecer cargar anteriores.

---

### User Story 3 - Mantener refresco operativo sin recargar historial innecesario (Priority: P2)

Como empleado del restaurante, quiero que el polling de WhatsApp siga mostrando actividad reciente sin volver a cargar todos los lotes historicos ya consultados.

**Why this priority**: El polling actual corre cada 10 segundos. Si cada tick vuelve a leer grandes cantidades de mensajes, la carga crece aunque no haya mensajes nuevos.

**Independent Test**: Puede probarse dejando la pantalla abierta y verificando que el polling refresque el lote reciente o nuevos mensajes sin pedir todos los lotes paginados previamente.

**Acceptance Scenarios**:

1. **Given** la lista de conversaciones esta abierta, **When** corre el polling, **Then** solo se refresca el alcance reciente necesario para mantener la lista actualizada.
2. **Given** una conversacion esta seleccionada, **When** corre el polling, **Then** la app actualiza mensajes recientes sin descartar mensajes anteriores ya cargados manualmente.
3. **Given** ocurre un error durante una carga adicional o refresco, **When** hay datos previos cargados, **Then** la UI conserva los datos existentes y muestra un error no bloqueante.

### Edge Cases

- Twilio pagina mensajes, pero la UI muestra conversaciones derivadas al agrupar por numero de cliente.
- Un lote de mensajes de Twilio puede contener muchos mensajes de una sola conversacion y menos conversaciones unicas que el limite pedido.
- Una conversacion puede requerir recorrer mas de una pagina de Twilio para encontrar suficientes mensajes del cliente seleccionado.
- Los cursores o tokens de Twilio no deben exponerse como detalle acoplado en componentes presentacionales.
- Las cargas adicionales no deben duplicar conversaciones ni mensajes ya visibles.
- El orden de conversaciones debe seguir siendo por ultimo mensaje descendente.
- El orden de mensajes dentro de una conversacion debe seguir siendo cronologico ascendente para lectura tipo chat.
- Los estados de carga, error y vacio deben seguir siendo claros.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST load WhatsApp conversation summaries in bounded pages instead of always loading the full configured recent message limit.
- **FR-002**: The system MUST use Twilio's server-side message pagination from the Next.js API/service layer, not direct Twilio calls from client components.
- **FR-003**: The system MUST expose an application-owned pagination contract to the frontend, such as `limit` and `nextCursor`, without coupling UI components to raw Twilio page tokens.
- **FR-004**: The system MUST allow the user to load additional conversation summaries after the initial page.
- **FR-005**: The system MUST load selected conversation messages in bounded pages, starting from the most recent messages.
- **FR-006**: The system MUST allow the user to load older messages for the selected conversation when more history is available.
- **FR-007**: The system MUST preserve existing mapping from Twilio message DTOs to UI-facing conversation and message models.
- **FR-008**: The system MUST avoid duplicate conversations and duplicate messages when merging additional pages or refresh results.
- **FR-009**: The system MUST preserve existing loading, empty, error, manual refresh, selected chat, and polling behavior where compatible with pagination.
- **FR-010**: The system MUST keep Twilio credentials and Twilio SDK usage isolated to server-side infrastructure/services.
- **FR-011**: The system MUST make page sizes configurable by code or environment defaults while validating unsafe values.
- **FR-012**: The system MUST not introduce persistent storage or a backend database as part of this feature.
- **FR-013**: The system MUST document any semantic limitation caused by deriving conversations from Twilio message pages rather than querying a native conversation entity.

### Key Entities *(include if feature involves data)*

- **Twilio Message Page**: A bounded result set returned by Twilio's message API with records and pagination metadata.
- **Pagination Cursor**: Application-owned token returned by the dashboard API to request the next page without exposing UI code to Twilio internals.
- **Conversation Summary Page**: UI-facing group of conversation summaries plus metadata indicating whether more conversations can be loaded.
- **Conversation Message Page**: UI-facing group of messages for one customer conversation plus metadata indicating whether older messages can be loaded.
- **Conversation Summary**: Existing UI model derived by grouping WhatsApp messages by customer phone number.
- **Conversation Message**: Existing UI model for a normalized Twilio WhatsApp message.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Initial WhatsApp conversation list loading processes a bounded number of Twilio records based on configured page size rather than the full historical/recent limit.
- **SC-002**: Employees can open WhatsApp - Mensajes and see the first conversations before additional pages are requested.
- **SC-003**: A selected conversation with long history initially renders only the recent message page and can load older messages on demand.
- **SC-004**: Additional page loads append/prepend data without duplicate visible conversations or messages.
- **SC-005**: Polling does not reload all previously loaded historical pages every 10 seconds.
- **SC-006**: Existing WhatsApp message UI behavior remains functionally equivalent for search, selection, refresh, loading, empty, and error states.

## Assumptions

- The current dashboard remains a Next.js app using server-side route handlers for Twilio access.
- The feature optimizes read behavior only; it does not change Twilio message storage or reservation logic.
- Conversation summaries are still derived from Twilio messages by customer phone number.
- A future backend sync/database may be considered later for stronger historical search and indexing, but is out of scope for this feature.
- Exact cursor encoding is an implementation detail owned by the API/service layer.
