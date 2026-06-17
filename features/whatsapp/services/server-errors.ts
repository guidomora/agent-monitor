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

  if (
    message.includes("TWILIO_CONVERSATION_PAGE_SIZE") ||
    message.includes("TWILIO_CHAT_MESSAGE_PAGE_SIZE") ||
    message.includes("TWILIO_RAW_PAGE_SIZE") ||
    message.includes("TWILIO_MAX_PAGES_PER_REQUEST")
  ) {
    return 500;
  }

  if (error instanceof Error && error.name === "PaginationRequestError") {
    return 400;
  }

  return 502;
}
