'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminChatConversation } from '@/lib/admin-api';
import { ChatMessage } from '@/lib/types';
import RequirePermission from '@/components/RequirePermission';

const CONVERSATIONS_POLL_MS = 5000;
const MESSAGES_POLL_MS = 4000;

export default function AdminMensajesPage() {
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function loadConversations() {
    const data = await adminApi.getChatConversations();
    setConversations(data);
    setLoading(false);
  }

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;

    async function poll() {
      const data = await adminApi.getChatMessages(selected!);
      if (!cancelled) setMessages(data);
      loadConversations();
    }

    poll();
    const interval = setInterval(poll, MESSAGES_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function handleSend() {
    const content = input.trim();
    if (!content || !selected || sending) return;
    setSending(true);
    try {
      const message = await adminApi.sendChatMessage(selected, content);
      setMessages((prev) => [...prev, message]);
      setInput('');
      loadConversations();
    } finally {
      setSending(false);
    }
  }

  const activeConversation = conversations.find((c) => c.id === selected);

  return (
    <RequirePermission permissions={['chat.respond']}>
    <div>
      <h1 className="text-2xl font-semibold mb-6">Mensajes</h1>

      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <div className="w-72 shrink-0 border border-gray-100 rounded-xl overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 p-4 text-sm">Cargando...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-400 p-4 text-sm">No hay conversaciones todavía.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selected === c.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{c.customerName || 'Visitante'}</span>
                  {c.unreadCount > 0 && (
                    <span className="text-[10px] bg-brand-accent text-white rounded-full w-5 h-5 shrink-0 flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMessage || 'Sin mensajes'}</p>
              </button>
            ))
          )}
        </div>

        <div className="flex-1 border border-gray-100 rounded-xl flex flex-col overflow-hidden">
          {!selected ? (
            <p className="text-gray-400 text-sm m-auto">Selecciona una conversación para responder</p>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 font-medium text-sm shrink-0">
                {activeConversation?.customerName || 'Visitante'}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      m.sender === 'admin'
                        ? 'bg-brand text-white ml-auto rounded-br-sm'
                        : 'bg-white border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe una respuesta..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </RequirePermission>
  );
}
