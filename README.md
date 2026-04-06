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
- `TWILIO_MESSAGE_LIMIT` opcional, para limitar cuántos mensajes recientes consulta el visor

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
# agent-monitor
