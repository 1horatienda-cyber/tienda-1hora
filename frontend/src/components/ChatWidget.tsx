'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage } from '@/lib/types';

const STORAGE_KEY = 'tienda-chat';
const POLL_INTERVAL_MS = 4000;

interface StoredChat {
  conversationId: string;
  customerToken: string;
}

function loadStoredChat(): StoredChat | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredChat;
  } catch {
    return null;
  }
}

function saveStoredChat(chat: StoredChat) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<StoredChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(loadStoredChat());
  }, []);

  useEffect(() => {
    if (!open || !chat) return;
    let cancelled = false;

    async function poll() {
      try {
        const data = await api.getChatMessages(chat!.conversationId, chat!.customerToken);
        if (!cancelled) setMessages(data);
      } catch {
        // error de red puntual: se reintenta en el próximo ciclo
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [open, chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function ensureConversation(): Promise<StoredChat> {
    if (chat) return chat;
    const created = await api.createChatConversation();
    const newChat = { conversationId: created.id, customerToken: created.customerToken };
    saveStoredChat(newChat);
    setChat(newChat);
    return newChat;
  }

  function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    ensureConversation();
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const current = await ensureConversation();
      const message = await api.sendChatMessage(current.conversationId, current.customerToken, content);
      setMessages((prev) => [...prev, message]);
      setInput('');
    } catch {
      // se deja el texto escrito para que el cliente pueda reintentar
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-brand text-white px-4 py-3 flex items-center justify-between shrink-0">
            <span className="font-medium text-sm">Chatea con nosotros</span>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-6">
                Escríbenos tu pregunta sobre algún producto y te respondemos aquí mismo.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                  m.sender === 'cliente'
                    ? 'bg-brand text-white ml-auto rounded-br-sm'
                    : 'bg-white border border-gray-200 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-2 border-t border-gray-100 flex gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="Enviar mensaje"
              className="w-9 h-9 shrink-0 rounded-full bg-brand text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-brand text-white shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
}
