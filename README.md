# Twilio WhatsApp Viewer

Visor local y de solo lectura para conversaciones de WhatsApp almacenadas en Twilio. La app agrupa mensajes por número, muestra un sidebar con previews y permite abrir el historial de cada conversación.

## Requisitos

- Node.js 20+
- Credenciales válidas de Twilio

## Variables de entorno

Copiá `.env.template` a `.env.local` y completá:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `TWILIO_MESSAGE_LIMIT` opcional, limite legacy para consultas recientes
- `TWILIO_CONVERSATION_PAGE_SIZE` opcional, cantidad inicial de chats a mostrar; default `20`
- `TWILIO_CHAT_MESSAGE_PAGE_SIZE` opcional, cantidad inicial de mensajes por chat; default `30`
- `TWILIO_RAW_PAGE_SIZE` opcional, cantidad de mensajes crudos por pagina de Twilio; default `50`
- `TWILIO_MAX_PAGES_PER_REQUEST` opcional, maximo de paginas de Twilio a recorrer por request; default `5`

## Levantar localmente

```bash
npm install
npm run dev
```

Abrí `http://localhost:3001`.

## Notas

- No usa base de datos.
- No expone credenciales al frontend.
- Toda la lectura se hace desde route handlers de Next en `app/api`.
- La agrupación de conversaciones se construye en memoria a partir de mensajes obtenidos con el SDK oficial `twilio`.
- La paginacion usa cursores propios de la app; el frontend no consume tokens de Twilio directamente.
# agent-monitor
