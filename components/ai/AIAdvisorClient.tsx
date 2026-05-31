"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { PainPoints } from "@/components/dashboard/PainPoints";
import { MonthlyReport } from "./MonthlyReport";
import { LevelDownSimulator } from "./LevelDownSimulator";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Por que meu dinheiro está sumindo?",
  "Onde posso cortar sem mudar meu estilo de vida?",
  "Me explica meu padrão de gastos esse mês",
  "Consigo economizar mais sem sofrimento?",
];

export function AIAdvisorClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "insights" | "report" | "simulator">("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text } = JSON.parse(data) as { text?: string };
            if (text) {
              accumulated += text;
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: accumulated },
              ]);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Erro ao conectar com o consultor. Tente novamente." },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Consultor IA</h1>
          <p className="text-xs text-muted-foreground">Análise honesta das suas finanças</p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["chat", "insights", "report", "simulator"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
              activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "chat" ? "Chat" : tab === "insights" ? "Pontos de Dor" : "Relatório Mensal"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {/* Messages area */}
                <ScrollArea className="h-[420px] p-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
                      <Sparkles className="w-10 h-10 text-primary/40" />
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
                        Pergunte qualquer coisa sobre suas finanças. Tenho acesso aos seus dados reais.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                        {QUICK_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="text-xs text-left p-2.5 rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3 h-3 text-primary" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            )}
                          >
                            {msg.content}
                            {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                              <span className="streaming-cursor" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input area */}
                <div className="border-t border-border p-3 flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Pergunte sobre suas finanças..."
                    className="text-sm"
                    disabled={streaming}
                  />
                  <Button
                    size="icon"
                    onClick={() => sendMessage(input)}
                    disabled={streaming || !input.trim()}
                    className="shrink-0"
                  >
                    {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "insights" && (
          <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PainPoints />
          </motion.div>
        )}

        {activeTab === "report" && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MonthlyReport />
          </motion.div>
        )}

        {activeTab === "simulator" && (
          <motion.div key="simulator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LevelDownSimulator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
