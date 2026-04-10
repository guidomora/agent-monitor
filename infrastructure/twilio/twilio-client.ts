import "server-only";
import twilio from "twilio";
import { getTwilioEnv } from "@/infrastructure/twilio/twilio-env";

let client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (client) {
    return client;
  }

  const env = getTwilioEnv();
  client = twilio(env.accountSid, env.authToken);

  return client;
}
