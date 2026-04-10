import "server-only";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
}

export function getErrorStatus(error: unknown) {
  const message = getErrorMessage(error);

  if (message.includes("Falta configurar la variable de entorno")) {
    return 500;
  }

  if (message.includes("TWILIO_MESSAGE_LIMIT")) {
    return 500;
  }

  return 502;
}
