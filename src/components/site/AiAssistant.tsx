import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

import { askAssistant } from "@/lib/assistant.functions";
import { ASSISTANT_AVATAR_URL } from "@/lib/media";
import { Button } from "@/components/ui/button";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiAssistant() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis l'assistante virtuelle de LIGHT TERRA GROUP. Posez-moi vos questions sur nos activités, nos projets ou une demande de devis.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: { messages: next.filter((m) => m.content).slice(-20) },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.ok ? res.reply : res.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Une erreur est survenue. Merci de réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistante" : "Discuter avec l'assistante"}
        className="fixed bottom-5 right-5 z-50 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-ink shadow-elevated transition hover:scale-105"
      >
        {open ? (
          <X className="h-6 w-6 text-gold" />
        ) : (
          <img
            src={ASSISTANT_AVATAR_URL}
            alt="Assistante virtuelle LIGHT TERRA GROUP"
            className="h-full w-full object-cover object-center"
            width={256}
            height={256}
          />
        )}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] max-h-[70vh] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
          <div className="flex items-center gap-3 bg-ink px-4 py-3 text-ink-foreground">
            <img
              src={ASSISTANT_AVATAR_URL}
              alt=""
              aria-hidden
              className="h-10 w-10 shrink-0 rounded-full border border-gold/60 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-base text-gold">Assistante LIGHT TERRA</p>
              <p className="text-xs text-ink-foreground/60">Réponses instantanées</p>
            </div>
          </div>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-ink px-3 py-2 text-sm text-ink-foreground"
                    : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
                }
              >
                {m.content}
              </div>
            ))}
            {loading ? <p className="text-xs text-muted-foreground">L'assistante écrit…</p> : null}
          </div>
          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              aria-label="Votre question"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <Button type="submit" size="icon" variant="gold" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
