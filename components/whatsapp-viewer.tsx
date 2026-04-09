"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, startTransition } from "react";
import type { ConversationMessage, ConversationSummary } from "@/lib/twilio/types";

type ConversationsResponse = {
  conversations: ConversationSummary[];
};

type MessagesResponse = {
  messages: ConversationMessage[];
};

type ErrorResponse = {
  error?: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return dateFormatter.format(new Date(value));
}

function buildPreview(conversation: ConversationSummary) {
  if (conversation.lastMessagePreview) {
    return conversation.lastMessagePreview;
  }

  return "Mensaje sin texto";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T & ErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "No se pudo obtener la información.");
  }

  return payload;
}

type WhatsAppViewerProps = {
  embedded?: boolean;
};

export function WhatsAppViewer({ embedded = false }: WhatsAppViewerProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const messageViewportRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  const filteredConversations = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const preview = conversation.lastMessagePreview?.toLowerCase() ?? "";

      return (
        conversation.phoneNumber.toLowerCase().includes(query) ||
        preview.includes(query)
      );
    });
  }, [conversations, deferredSearch]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConversations() {
      setIsLoadingConversations(true);
      setConversationsError(null);

      try {
        const payload = await readJson<ConversationsResponse>("/api/conversations", {
          signal: controller.signal,
        });

        setConversations(payload.conversations);
      } catch (error) {
        if (!isAbortError(error)) {
          setConversationsError(
            error instanceof Error ? error.message : "No se pudo cargar el listado.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingConversations(false);
        }
      }
    }

    void loadConversations();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setMessagesError(null);
      setIsLoadingMessages(false);
      return;
    }

    const controller = new AbortController();
    const conversationId = selectedConversationId;

    async function loadMessages() {
      setIsLoadingMessages(true);
      setMessagesError(null);

      try {
        const payload = await readJson<MessagesResponse>(
          `/api/conversations/${encodeURIComponent(conversationId)}`,
          { signal: controller.signal },
        );

        setMessages(payload.messages);
      } catch (error) {
        if (!isAbortError(error)) {
          setMessagesError(
            error instanceof Error ? error.message : "No se pudo cargar la conversación.",
          );
          setMessages([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingMessages(false);
        }
      }
    }

    void loadMessages();

    return () => controller.abort();
  }, [selectedConversationId]);

  useEffect(() => {
    if (messageViewportRef.current) {
      messageViewportRef.current.scrollTop = messageViewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={embedded ? "app-shell app-shell--embedded" : "app-shell"}>
      {embedded ? (
        <header className="section-intro">
          <div>
            <p className="dashboard-eyebrow">Mensajes / WhatsApp</p>
            <h2>Viewer actual dentro del nuevo sistema</h2>
            <p>
              La lectura sigue siendo de solo consulta. Esta pantalla solo
              cambia de contexto visual para convivir con el dashboard general.
            </p>
          </div>
        </header>
      ) : null}
      <div
        className={`flex w-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-panel text-foreground panel-shadow lg:grid lg:grid-cols-[340px_minmax(0,1fr)] ${
          embedded
            ? "min-h-[720px] lg:h-[calc(100dvh-132px)] lg:min-h-0"
            : "min-h-[calc(100dvh-48px)] lg:h-[calc(100dvh-48px)] lg:min-h-0"
        }`}
      >
        <aside className="flex min-h-[320px] flex-col border-b border-border/80 bg-background-strong/70 lg:min-h-0 lg:h-full lg:border-r lg:border-b-0">
          <div className="border-b border-border/80 px-5 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
              Twilio / WhatsApp
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.04em]">
                  Conversation Viewer
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Solo lectura, agrupado por número.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedConversationId(null);
                  setSearch("");
                  setIsLoadingConversations(true);
                  setConversationsError(null);
                  void readJson<ConversationsResponse>("/api/conversations")
                    .then((payload) => {
                      setConversations(payload.conversations);
                    })
                    .catch((error: unknown) => {
                      setConversationsError(
                        error instanceof Error
                          ? error.message
                          : "No se pudo actualizar el listado.",
                      );
                    })
                    .finally(() => {
                      setIsLoadingConversations(false);
                    });
                }}
                className="rounded-full border border-border bg-panel-strong px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition hover:border-accent/30 hover:text-accent"
              >
                Recargar
              </button>
            </div>
            <label className="mt-4 block">
              <span className="sr-only">Buscar conversaciones</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar número o mensaje..."
                className="w-full rounded-2xl border border-border bg-panel-strong px-4 py-3 text-sm outline-none transition placeholder:text-muted/80 focus:border-accent/45"
              />
            </label>
          </div>

          <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3 lg:min-h-0">
            {isLoadingConversations ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-3xl border border-border/70 bg-panel-strong px-4 py-4"
                  >
                    <div className="h-4 w-28 rounded-full bg-background" />
                    <div className="mt-3 h-3 w-full rounded-full bg-background" />
                    <div className="mt-2 h-3 w-20 rounded-full bg-background" />
                  </div>
                ))}
              </div>
            ) : conversationsError ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-950/40 px-4 py-5 text-sm text-red-200">
                <p className="font-medium">No se pudo cargar la lista.</p>
                <p className="mt-2 text-red-200/85">{conversationsError}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-panel-strong px-4 py-6 text-sm text-muted">
                No hay conversaciones para mostrar con el filtro actual.
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredConversations.map((conversation) => {
                  const isActive = conversation.id === selectedConversationId;

                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(() => {
                            setSelectedConversationId(conversation.id);
                          })
                        }
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          isActive
                            ? "border-accent/30 bg-accent-soft"
                            : "border-border/70 bg-panel-strong hover:border-accent/20 hover:bg-white/4"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold tracking-[-0.02em]">
                            {conversation.phoneNumber}
                          </p>
                          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                            {formatTimestamp(conversation.lastMessageAt)}
                          </p>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                          {buildPreview(conversation)}
                        </p>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                          {conversation.messageCount} mensaje
                          {conversation.messageCount === 1 ? "" : "s"}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col bg-panel-strong/60 lg:min-h-0 lg:h-full">
          <header className="border-b border-border/80 px-5 py-5 sm:px-7">
            {selectedConversation ? (
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                    Conversación activa
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                    {selectedConversation.phoneNumber}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    Última actividad
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {formatTimestamp(selectedConversation.lastMessageAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  Panel principal
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                  Seleccioná una conversación
                </h2>
              </div>
            )}
          </header>

          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="max-w-md rounded-[32px] border border-dashed border-border bg-background px-6 py-10 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                  Estado vacío
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
                  Elegí un número para leer el historial.
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  Esta app no envía mensajes ni modifica nada en Twilio. Solo
                  consulta y agrupa el historial existente.
                </p>
              </div>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex-1 px-5 py-5 sm:px-7 lg:min-h-0">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`max-w-[78%] animate-pulse rounded-[24px] px-4 py-4 ${
                      index % 2 === 0 ? "bg-incoming" : "ml-auto bg-outgoing"
                    }`}
                  >
                    <div className="h-3 w-full rounded-full bg-white/10" />
                    <div className="mt-2 h-3 w-3/5 rounded-full bg-white/8" />
                  </div>
                ))}
              </div>
            </div>
          ) : messagesError ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="max-w-md rounded-[28px] border border-red-500/30 bg-red-950/40 px-6 py-6 text-sm text-red-200">
                <p className="font-medium">No se pudo cargar la conversación.</p>
                <p className="mt-2">{messagesError}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="max-w-md rounded-[28px] border border-dashed border-border bg-background px-6 py-8 text-center text-sm text-muted">
                No hay mensajes disponibles para este número dentro del rango consultado.
              </div>
            </div>
          ) : (
            <div
              ref={messageViewportRef}
              className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 sm:px-7 lg:min-h-0"
            >
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOutgoing = message.direction === "outbound";

                  return (
                    <article
                      key={message.id}
                      className={`max-w-[85%] rounded-[26px] border px-4 py-4 sm:max-w-[78%] ${
                        isOutgoing
                          ? "ml-auto border-accent/15 bg-outgoing"
                          : "border-border/70 bg-incoming"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                          {isOutgoing ? "AI Agent" : "Entrante"}
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                          {formatTimestamp(message.sentAt)}
                        </p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                        {message.body || "Mensaje sin texto"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-muted">
                        {message.status ? <span>Estado: {message.status}</span> : null}
                        {message.mediaCount > 0 ? (
                          <span>Media: {message.mediaCount}</span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
