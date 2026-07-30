import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '@/services/api';
import { APP_NAME } from '@/utils/constants';

const STORAGE_KEY = 'storee_chat_history';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: `Hi! I'm the ${APP_NAME} assistant. Ask me about our products, shipping, returns, or the status of your order.`,
};

function loadHistory(): ChatMessage[] {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Corrupt history — start fresh
  }
  return [WELCOME_MESSAGE];
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full/unavailable — chat still works, just won't persist
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      // The welcome message is client-side only; the backend requires the
      // conversation to start with a user message
      const history = nextMessages.filter((m, i) => !(i === 0 && m.role === 'assistant'));
      const response = await sendChatMessage(history);
      const reply = response.data?.reply?.trim();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply || "Sorry, I couldn't come up with a reply. Please try again.",
        },
      ]);
    } catch (error: any) {
      console.error('[ChatWidget] Failed to send message:', error);
      const message =
        error?.response?.status === 429
          ? "You're sending messages too quickly — please wait a few minutes and try again."
          : "Sorry, I'm having trouble right now. Please try again in a moment, or email thestoree.in@gmail.com.";
      setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400 text-white shadow-lg transition-colors hover:bg-rose-500"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ink-100 bg-parchment-50 shadow-2xl">
          <div className="flex items-center justify-between bg-rose-400 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">{APP_NAME} Assistant</p>
              <p className="text-xs text-rose-100">Products · Orders · Shipping</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-rose-500">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, i) => (
              <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'rounded-br-sm bg-rose-400 text-white'
                      : 'rounded-bl-sm bg-parchment-200 text-ink-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-parchment-200 px-3 py-2 text-sm text-ink-400">
                  Typing…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-ink-100 bg-parchment-50 px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              maxLength={2000}
              placeholder="Type your message…"
              className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-800 outline-none focus:border-rose-400"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-400 text-white transition-colors hover:bg-rose-500 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
