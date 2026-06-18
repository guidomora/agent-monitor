export interface WhatsAppViewerProps {
  embedded?: boolean;
}

export interface LoadOptions {
  mode?: "initial" | "refresh";
  signal?: AbortSignal;
}
