/**
 * AI layer — provider priority: OpenRouter → Groq → Anthropic
 * Set OPENROUTER_API_KEY (free at openrouter.ai) for best results.
 * Set GROQ_API_KEY as fallback. Set ANTHROPIC_API_KEY as final fallback.
 */
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { messageOps, userOps, pendingOps, type User } from '../db/client.js';
import { TOOL_DEFINITIONS, executeTool } from '../tools/index.js';
import { mp, resolveToken } from './nova.js';

// ── Provider selection ────────────────────────────────────────────────────────

const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
const useGroq = !!process.env.GROQ_API_KEY;
const useAnthropic = !!process.env.ANTHROPIC_API_KEY;

if (!useOpenRouter && !useGroq && !useAnthropic) {
  console.warn('[ai] No AI key set. Add OPENROUTER_API_KEY (free at openrouter.ai) to .env');
}

const openrouter = useOpenRouter ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null;
const groq = useGroq ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const anthropic = useAnthropic ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(user: User | undefined): string {
  const wallet = user?.wallet_name ? `Wallet: ${user.wallet_name} (${user.chain})` : 'No wallet set up yet';
  const chain = user?.chain ?? 'solana';
  const risk = user?.risk_profile ?? 'moderate';
  const onboarded = user?.onboarded ?? 0;

  return `You are Poke — a sharp, crypto-native AI assistant. You're who people text when they want live data, to make a trade, set up automations, or just talk crypto.

User:
- ${wallet}
- Chain preference: ${chain}
- Risk: ${risk}

${!onboarded ? `New user — call get_wallets to see if they have a wallet set up, then greet them warmly and list what you can do. Don't call get_portfolio unless they ask.` : ''}

TOOL RULES (critical — follow exactly):
- Any question about prices, trending tokens, portfolio, or prediction markets → ALWAYS call the tool. Never guess or invent data.
- "trending on solana" → call get_trending_tokens with chain: "solana"
- "price of ETH/SOL/BTC/any token" → call get_price
- "my portfolio / my balance" → call get_wallets then get_portfolio
- Only call get_prediction_markets if user explicitly asks about prediction markets, bets, or Polymarket/Kalshi
- Swaps: quote_swap first → then request_swap (waits for user YES)
- "my baskets" / "show baskets" / "basket" → call list_baskets
- "show me [basket name]" / "open [basket name]" → call list_baskets first to get the ID, then get_basket
- Only skip tools for pure opinion/discussion with zero live data needed

Capabilities:
- Live prices, trending tokens, token safety checks (via Nova CLI)
- Portfolio balances across any chain
- Token swaps (quote → confirm → execute)
- Buy crypto with fiat (returns checkout URL)
- Recipes: DCA (recurring buys), price alerts, prediction bets, yield/perps coming soon
- Polymarket & Kalshi prediction markets — browse, buy YES/NO positions
- Baskets: named groups of tokens + prediction markets with target weights. Use list_baskets, create_basket, get_basket, delete_basket

Format:
- iMessage-friendly: short, plain text, no markdown headers or bullets
- Conversational tone — like a knowledgeable friend who trades
- Numbers: commas for thousands, up to 6 decimals for small tokens
- Prediction market prices as cents (e.g. 65¢ = 65% implied probability)`;
}

// Strip leaked llama function call syntax from text responses
function stripFunctionTags(text: string): string {
  return text.replace(/<function=[^>]*>.*?<\/function>/gs, '').trim();
}

// ── Convert Anthropic tool defs → Groq/OpenAI format ─────────────────────────

function toGroqTools(tools: Anthropic.Tool[]): Groq.Chat.ChatCompletionTool[] {
  return tools.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description ?? '',
      parameters: t.input_schema as Record<string, unknown>,
    },
  }));
}

// ── Main message processor ────────────────────────────────────────────────────

export async function processMessage(phone: string, userMessage: string): Promise<string> {
  const user = userOps.get(phone);

  // Confirmation flow
  const pending = pendingOps.get(phone);
  const trimmed = userMessage.trim().toLowerCase();
  if (pending) {
    if (['yes', 'y', 'confirm', 'ok', 'yep', 'yeah', 'do it', 'go', 'send it'].includes(trimmed)) {
      pendingOps.clear(phone);
      return executePendingAction(pending, user);
    }
    if (['no', 'n', 'cancel', 'nope', 'stop', 'abort'].includes(trimmed)) {
      pendingOps.clear(phone);
      return 'Cancelled. Anything else?';
    }
  }

  if (!user) userOps.upsert(phone, {});

  messageOps.save(phone, 'user', userMessage);
  const history = messageOps.recent(phone, 12);
  const systemPrompt = buildSystemPrompt(user);

  let reply: string;

  if (useOpenRouter && openrouter) {
    reply = await runOpenRouter(openrouter, systemPrompt, history, { phone });
  } else if (useGroq && groq) {
    try {
      reply = await runGroq(groq, systemPrompt, history, { phone });
    } catch (err: any) {
      if (err.status === 429 || String(err.message).includes('rate_limit')) {
        console.warn('[ai] Groq rate limit:', err.message);
        reply = "Hit Groq's daily limit — I'll be back in a few hours. Upgrade at console.groq.com if you need me now.";
      } else {
        throw err;
      }
    }
  } else if (useAnthropic && anthropic) {
    reply = await runAnthropic(anthropic, systemPrompt, history, { phone });
  } else {
    reply = 'No AI provider configured. Add GROQ_API_KEY (free at groq.com) to .env';
  }

  // Auto-onboard: store wallet on first successful response
  if (!user?.onboarded) {
    try {
      const wallets = mp.wallets.list();
      if (wallets?.length) {
        const w = wallets[0];
        userOps.upsert(phone, {
          wallet_name: w.name,
          wallet_addr: w.addresses?.solana || w.addresses?.ethereum,
          onboarded: 1,
        });
      }
    } catch { /* not yet authed */ }
  }

  messageOps.save(phone, 'assistant', reply);
  return reply;
}

// ── OpenRouter runner ─────────────────────────────────────────────────────────

async function runOpenRouter(
  client: OpenAI,
  system: string,
  history: { role: string; content: string }[],
  ctx: { phone: string },
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  const tools: OpenAI.Chat.ChatCompletionTool[] = TOOL_DEFINITIONS.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description ?? '',
      parameters: t.input_schema as Record<string, unknown>,
    },
  }));

  let lastText = '';

  for (let i = 0; i < 6; i++) {
    const res = await client.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1024,
      temperature: 0.1,
    });

    const msg = res.choices[0].message;
    if (msg.content) lastText = msg.content;

    messages.push({
      role: 'assistant',
      content: msg.content ?? '',
      tool_calls: msg.tool_calls,
    } as OpenAI.Chat.ChatCompletionMessageParam);

    if (!msg.tool_calls?.length) {
      return stripFunctionTags(msg.content ?? "I'm on it.");
    }

    for (const call of msg.tool_calls) {
      let input: Record<string, any> = {};
      try { input = JSON.parse(call.function.arguments); } catch { /* empty */ }
      console.log(`[tool] ${call.function.name}(${call.function.arguments})`);
      const result = await executeTool(call.function.name, input, ctx);
      console.log(`[tool] result: ${result.slice(0, 120)}`);
      messages.push({ role: 'tool', tool_call_id: call.id, content: result });
    }
  }

  return stripFunctionTags(lastText) || "Couldn't complete that — try again.";
}

// ── Groq runner (OpenAI-compatible) ──────────────────────────────────────────

async function runGroq(
  client: Groq,
  system: string,
  history: { role: string; content: string }[],
  ctx: { phone: string },
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  const tools = toGroqTools(TOOL_DEFINITIONS);
  let lastText = '';

  for (let i = 0; i < 6; i++) {
    const res = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1024,
      temperature: 0.1,
      parallel_tool_calls: false,
    });

    const msg = res.choices[0].message;
    if (msg.content) lastText = msg.content;

    // Must push with content as string (not null) to avoid Groq format errors
    messages.push({
      role: 'assistant',
      content: msg.content ?? '',
      tool_calls: msg.tool_calls,
    } as Groq.Chat.ChatCompletionMessageParam);

    if (!msg.tool_calls?.length) {
      return msg.content ?? "I'm on it.";
    }

    // Execute each tool call
    for (const call of msg.tool_calls) {
      let input: Record<string, any> = {};
      try { input = JSON.parse(call.function.arguments); } catch { /* empty */ }
      console.log(`[tool] ${call.function.name}(${call.function.arguments})`);
      const result = await executeTool(call.function.name, input, ctx);
      console.log(`[tool] result: ${result.slice(0, 120)}`);
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: result,
      });
    }
  }

  return stripFunctionTags(lastText) || "Couldn't complete that — try again.";
}

// ── Anthropic runner ──────────────────────────────────────────────────────────

async function runAnthropic(
  client: Anthropic,
  system: string,
  history: { role: string; content: string }[],
  ctx: { phone: string },
): Promise<string> {
  let messages: Anthropic.MessageParam[] = history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  let finalText = '';

  for (let i = 0; i < 6; i++) {
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    const textBlocks = res.content.filter(b => b.type === 'text');
    if (textBlocks.length) finalText = textBlocks.map(b => (b as Anthropic.TextBlock).text).join('');
    if (res.stop_reason === 'end_turn') break;

    if (res.stop_reason === 'tool_use') {
      const toolUses = res.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[];
      messages.push({ role: 'assistant', content: res.content });
      const results: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUses.map(async t => ({
          type: 'tool_result' as const,
          tool_use_id: t.id,
          content: await executeTool(t.name, t.input as Record<string, any>, ctx),
        })),
      );
      messages.push({ role: 'user', content: results });
      continue;
    }
    break;
  }

  return finalText || "I'm on it.";
}

// ── Execute confirmed pending action ──────────────────────────────────────────

function executePendingAction(
  pending: { action_type: string; payload: string; preview: string },
  user: User | undefined,
): string {
  const payload = JSON.parse(pending.payload);

  try {
    if (pending.action_type === 'swap') {
      const from = resolveToken(payload.from_symbol, payload.chain);
      const to = resolveToken(payload.to_symbol, payload.chain);
      if (!from || !to) return 'Could not resolve tokens. Try again.';
      const result = mp.token.swap(payload.wallet_name, payload.chain, from.address, to.address, payload.amount);
      const txHash = result?.txHash ?? result?.transactionHash ?? result?.signature;
      return ['Swap executed!', `${payload.amount} ${from.symbol} → ${to.symbol}`, txHash ? `TX: ${txHash.slice(0, 12)}...` : ''].filter(Boolean).join('\n');
    }

    if (pending.action_type === 'prediction_buy') {
      const walletName = payload.wallet_name || user?.wallet_name;
      if (!walletName) return 'No wallet configured.';
      const result = mp.predict.buyPosition(walletName, payload.provider ?? 'polymarket', payload.token_id, payload.price, payload.size);
      const shares = result?.shares ?? result?.size;
      return ['Position opened!', shares ? `${shares} shares` : '', payload.preview].filter(Boolean).join('\n');
    }

    return 'Done.';
  } catch (err: any) {
    return `Failed: ${err.message}`;
  }
}
