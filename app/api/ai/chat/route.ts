import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages, conversationId } = await request.json() as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    conversationId?: string;
  };

  // Fetch context data
  const [profileResult, txResult, categoriesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(50),
    supabase.from("categories").select("id, name").eq("user_id", user.id),
  ]);

  const profile = profileResult.data;
  const transactions = txResult.data ?? [];
  const categoriesMap: Record<string, string> = {};
  (categoriesResult.data ?? []).forEach((c) => { categoriesMap[c.id] = c.name; });

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const currentMonthTx = transactions.filter((t) => t.date >= monthStart);
  const income = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const systemPrompt = buildChatSystemPrompt(
    profile!,
    transactions,
    categoriesMap,
    { income, expense, savings: income - expense }
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const aiStream = anthropic.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      let fullText = "";

      aiStream.on("text", (text) => {
        fullText += text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      });

      aiStream.on("finalMessage", async () => {
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();

        // Persist conversation
        if (conversationId) {
          const allMessages = [
            ...messages,
            { role: "assistant", content: fullText, timestamp: new Date().toISOString() },
          ];
          await supabase
            .from("ai_conversations")
            .update({ messages: allMessages as never, updated_at: new Date().toISOString() })
            .eq("id", conversationId);
        }
      });

      aiStream.on("error", (err) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
