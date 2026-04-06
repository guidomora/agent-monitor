import "server-only";

type TwilioEnv = {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
  messageLimit: number;
};

function normalizeWhatsappNumber(value: string) {
  return value.replace(/^whatsapp:/i, "").trim();
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta configurar la variable de entorno ${name}.`);
  }

  return value;
}

function parseMessageLimit() {
  const rawValue = process.env.TWILIO_MESSAGE_LIMIT?.trim();

  if (!rawValue) {
    return 250;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("TWILIO_MESSAGE_LIMIT debe ser un entero positivo.");
  }

  return Math.min(value, 1000);
}

let cachedEnv: TwilioEnv | null = null;

export function getTwilioEnv(): TwilioEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    accountSid: readRequiredEnv("TWILIO_ACCOUNT_SID"),
    authToken: readRequiredEnv("TWILIO_AUTH_TOKEN"),
    whatsappNumber: normalizeWhatsappNumber(
      readRequiredEnv("TWILIO_WHATSAPP_NUMBER"),
    ),
    messageLimit: parseMessageLimit(),
  };

  return cachedEnv;
}
