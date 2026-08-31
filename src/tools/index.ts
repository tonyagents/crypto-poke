import type Anthropic from '@anthropic-ai/sdk';
import { mp, resolveToken } from '../services/nova.js';
import { recipeOps, pendingOps, basketOps, curatedBasketOps, type BasketAsset } from '../db/client.js';
import { valueBasket } from '../services/basket-snapshots.js';
import { v4 as uuid } from 'uuid';

// ── Tool Definitions ──────────────────────────────────────────────────────────

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'get_wallets',
    description: 'List all local Nova wallets with their addresses. Call this whenever you need wallet info.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_portfolio',
    description: 'Get live token balances and USD value for a wallet on a chain. Use this for any portfolio/balance question.',
    input_schema: {
      type: 'object',
      properties: {
        wallet_addr: { type: 'string', description: 'Wallet address' },
        chain: { type: 'string', description: 'solana, ethereum, base, etc.' },
      },
      required: ['wallet_addr', 'chain'],
    },
  },
  {
    name: 'get_price',
    description: 'Get live price, 24h change, volume, and market data for any token. ALWAYS use this — never guess prices.',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Token symbol e.g. SOL, ETH, BTC' },
        chain: { type: 'string', description: 'solana, ethereum, base, etc.' },
      },
      required: ['symbol', 'chain'],
    },
  },
  {
    name: 'get_trending_tokens',
    description: 'Get currently trending tokens on a chain with live prices and % changes. ALWAYS use this — never make up trending data.',
    input_schema: {
      type: 'object',
      properties: {
        chain: { type: 'string', description: 'solana, ethereum, base, etc.' },
      },
      required: ['chain'],
    },
  },
  {
    name: 'check_token',
    description: 'Check a token contract address for safety risks — honeypot, liquidity, holder concentration.',
    input_schema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Token contract address' },
        chain: { type: 'string' },
      },
      required: ['address', 'chain'],
    },
  },
  {
    name: 'search_token',
    description: 'Search for a token by name or symbol to get its contract address and market data.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Token name or symbol' },
        chain: { type: 'string' },
      },
      required: ['query', 'chain'],
    },
  },
  {
    name: 'quote_swap',
    description: 'Get a live quote for swapping tokens — rate, output amount, fees. Call before any swap.',
    input_schema: {
      type: 'object',
      properties: {
        from_symbol: { type: 'string', description: 'Token to sell e.g. SOL' },
        to_symbol: { type: 'string', description: 'Token to buy e.g. USDC' },
        amount: { type: 'string', description: 'Amount of from_symbol to sell' },
        chain: { type: 'string' },
      },
      required: ['from_symbol', 'to_symbol', 'amount', 'chain'],
    },
  },
  {
    name: 'request_swap',
    description: 'Stage a swap for user confirmation. Call after quote_swap when user wants to execute.',
    input_schema: {
      type: 'object',
      properties: {
        from_symbol: { type: 'string' },
        to_symbol: { type: 'string' },
        amount: { type: 'string' },
        chain: { type: 'string' },
        wallet_name: { type: 'string' },
        preview: { type: 'string', description: 'e.g. "Swap 1 SOL → ~182 USDC on Solana"' },
      },
      required: ['from_symbol', 'to_symbol', 'amount', 'chain', 'wallet_name', 'preview'],
    },
  },
  {
    name: 'buy_crypto',
    description: 'Buy crypto with fiat via Nova onramp. Returns a checkout URL.',
    input_schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token symbol: eth, sol, btc, usdc' },
        amount_usd: { type: 'string', description: 'USD amount' },
        wallet_name: { type: 'string' },
      },
      required: ['token', 'amount_usd', 'wallet_name'],
    },
  },
  {
    name: 'create_recipe',
    description: 'Create an automated strategy: DCA, price alert, yield, perp, or prediction market bet.',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['dca', 'alert', 'yield', 'perp', 'predict'] },
        name: { type: 'string', description: 'Friendly name' },
        cron_expr: { type: 'string', description: 'Cron schedule e.g. "0 9 * * 1" = Monday 9am' },
        config: {
          type: 'object',
          description: 'DCA: {token, amount_usd, wallet_name, chain}. Alert: {symbol, chain, condition: "above"|"below", price}.',
        },
      },
      required: ['type', 'name', 'cron_expr', 'config'],
    },
  },
  {
    name: 'list_recipes',
    description: "List the user's active automated recipes.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'cancel_recipe',
    description: 'Cancel an active recipe by its ID.',
    input_schema: {
      type: 'object',
      properties: {
        recipe_id: { type: 'string' },
      },
      required: ['recipe_id'],
    },
  },
  {
    name: 'get_prediction_markets',
    description: 'Browse trending or search Polymarket/Kalshi prediction markets with live odds. ALWAYS use this for market questions.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query. Leave empty for trending.' },
        provider: { type: 'string', enum: ['polymarket', 'kalshi'], description: 'Market provider. Default: polymarket.' },
      },
      required: [],
    },
  },
  {
    name: 'request_prediction_buy',
    description: 'Stage a prediction market position buy for user confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        wallet_name: { type: 'string' },
        provider: { type: 'string', description: 'polymarket or kalshi' },
        token_id: { type: 'string', description: 'outcomeTokens[].tokenId from search results' },
        price: { type: 'string', description: '0–1 limit price per share (e.g. "0.65")' },
        size: { type: 'string', description: 'Number of shares to buy' },
        preview: { type: 'string', description: 'e.g. "Buy 50 YES shares at $0.65 on Trump 2028"' },
      },
      required: ['wallet_name', 'provider', 'token_id', 'price', 'size', 'preview'],
    },
  },
  {
    name: 'get_prediction_positions',
    description: "Get the user's open prediction market positions.",
    input_schema: {
      type: 'object',
      properties: {
        wallet_addr: { type: 'string' },
      },
      required: ['wallet_addr'],
    },
  },
  {
    name: 'create_basket',
    description: 'Create a named asset basket grouping tokens, prediction markets, and/or perps with target weights. Weights should sum to 1.0. Each asset needs a type ("token", "prediction", or "perp"), a label, and a weight. Token assets need symbol, address, and chain. Prediction assets need tokenId and provider. Perp assets need perpSymbol, perpSide ("long"|"short"), and perpLeverage.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Basket name e.g. "Futures Bucket"' },
        description: { type: 'string', description: 'What this basket tracks' },
        assets: {
          type: 'array',
          description: 'Array of assets with target weights',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['token', 'prediction', 'perp'] },
              label: { type: 'string' },
              weight: { type: 'number', description: '0–1 target allocation' },
              symbol: { type: 'string' },
              address: { type: 'string' },
              chain: { type: 'string' },
              tokenId: { type: 'string' },
              provider: { type: 'string' },
              perpSymbol: { type: 'string' },
              perpSide: { type: 'string', enum: ['long', 'short'] },
              perpLeverage: { type: 'number' },
            },
            required: ['type', 'label', 'weight'],
          },
        },
      },
      required: ['name', 'assets'],
    },
  },
  {
    name: 'list_curated_baskets',
    description: 'List Arc-curated basket templates (Made in America, AI Infrastructure, etc.). Use these as starting points users can fork into their own baskets.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'fork_curated_basket',
    description: 'Fork a curated basket template into the user\'s own baskets. Pass the template id from list_curated_baskets. Optionally override the name.',
    input_schema: {
      type: 'object',
      properties: {
        template_id: { type: 'string' },
        name: { type: 'string', description: 'Optional new name; defaults to the template name.' },
      },
      required: ['template_id'],
    },
  },
  {
    name: 'get_basket',
    description: 'Get live snapshot of a basket — current prices, USD values, and drift from target weights. Pass basket ID from list_baskets.',
    input_schema: {
      type: 'object',
      properties: {
        basket_id: { type: 'string' },
        wallet_addr: { type: 'string', description: 'Wallet to read actual holdings from (optional)' },
      },
      required: ['basket_id'],
    },
  },
  {
    name: 'list_baskets',
    description: "List all of the user's saved baskets.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'delete_basket',
    description: 'Delete a basket by ID.',
    input_schema: {
      type: 'object',
      properties: {
        basket_id: { type: 'string' },
      },
      required: ['basket_id'],
    },
  },
];

// ── Tool Handlers ─────────────────────────────────────────────────────────────

export type ToolContext = { phone: string };

export async function executeTool(
  name: string,
  input: Record<string, any>,
  ctx: ToolContext,
): Promise<string> {
  try {
    switch (name) {

      case 'get_wallets': {
        const wallets = mp.wallets.list();
        if (!wallets?.length) return 'No wallets found.';
        return wallets.map((w: any) =>
          `• ${w.name} (${w.type})\n  SOL: ${w.addresses?.solana ?? '—'}\n  ETH: ${w.addresses?.ethereum ?? '—'}`
        ).join('\n\n');
      }

      case 'get_portfolio': {
        const data = mp.token.balances(input.wallet_addr, input.chain);
        const items: any[] = data?.items ?? [];
        if (!items.length) return `No tokens found in wallet on ${input.chain}.`;
        const total = items.reduce((s, t) => s + (t.balance?.usdValue ?? 0), 0);
        const lines = items.slice(0, 15).map((t: any) => {
          const val = t.balance?.usdValue ?? 0;
          const amt = t.balance?.formatted ?? '?';
          return `${t.symbol}: ${amt} (~$${val.toFixed(2)})`;
        });
        return `Portfolio (${input.chain}):\n${lines.join('\n')}\n\nTotal: ~$${total.toFixed(2)}`;
      }

      case 'get_price': {
        const results = mp.token.search(input.symbol, input.chain, 1);
        const token = results?.items?.[0];
        if (!token) return `Token "${input.symbol}" not found on ${input.chain}.`;
        const md = token?.marketData ?? {};
        const price = md.price;
        const chg = md.priceChangePercent?.['24h'] ?? md.priceChange24h;
        const vol = md.volume?.['24h'] ?? md.volume24h;
        const mcap = md.marketCap;
        return [
          `${token.name} (${token.symbol})`,
          `Price: $${price != null ? price.toLocaleString(undefined, { maximumFractionDigits: 6 }) : 'N/A'}`,
          chg != null ? `24h: ${chg > 0 ? '+' : ''}${(chg * (Math.abs(chg) < 1 ? 100 : 1)).toFixed(2)}%` : null,
          vol != null ? `Volume: $${(vol / 1e6).toFixed(2)}M` : null,
          mcap != null ? `MCap: $${(mcap / 1e9).toFixed(2)}B` : null,
        ].filter(Boolean).join('\n');
      }

      case 'get_trending_tokens': {
        const data = mp.token.trending(input.chain, 10, 1);
        const items: any[] = data?.items ?? [];
        if (!items.length) return `No trending tokens on ${input.chain}.`;
        const lines = items.map((t: any, i: number) => {
          const price = t.marketData?.price;
          const chg = t.marketData?.priceChangePercent?.['24h'] ?? t.marketData?.priceChange24h;
          const chgStr = chg != null ? ` ${chg > 0 ? '+' : ''}${chg.toFixed(1)}%` : '';
          const priceStr = price != null
            ? price < 0.01
              ? `$${price.toFixed(8)}`
              : `$${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
            : '?';
          return `${i + 1}. ${t.symbol} — ${priceStr}${chgStr}`;
        });
        return `Trending on ${input.chain}:\n${lines.join('\n')}`;
      }

      case 'check_token': {
        const data = mp.token.check(input.address, input.chain);
        const risk = data?.riskLevel ?? 'unknown';
        const warnings: string[] = data?.warnings ?? [];
        return [
          `Risk: ${risk.toUpperCase()}`,
          warnings.length
            ? `Warnings:\n${warnings.map((w: string) => `• ${w}`).join('\n')}`
            : 'No warnings detected.',
        ].join('\n');
      }

      case 'search_token': {
        const data = mp.token.search(input.query, input.chain, 5);
        const items: any[] = data?.items ?? [];
        if (!items.length) return `No tokens found for "${input.query}" on ${input.chain}.`;
        return items.map((t: any) => {
          const price = t.marketData?.price;
          return `${t.symbol} — ${t.name}\nAddress: ${t.address}\nPrice: $${price?.toLocaleString() ?? 'N/A'}`;
        }).join('\n\n');
      }

      case 'quote_swap': {
        const from = resolveToken(input.from_symbol, input.chain);
        const to = resolveToken(input.to_symbol, input.chain);
        if (!from) return `Token "${input.from_symbol}" not found.`;
        if (!to) return `Token "${input.to_symbol}" not found.`;
        const data = mp.token.quote(from.address, to.address, input.amount, input.chain);
        const toAmt = data?.toAmount ?? data?.outputAmount ?? '?';
        const rate = data?.exchangeRate ?? data?.price ?? '?';
        return [
          `Quote: ${input.amount} ${from.symbol} → ${toAmt} ${to.symbol}`,
          `Rate: 1 ${from.symbol} = ${rate} ${to.symbol}`,
          data?.fees ? `Fees: ${data.fees}` : null,
        ].filter(Boolean).join('\n');
      }

      case 'request_swap': {
        pendingOps.set(ctx.phone, 'swap', {
          from_symbol: input.from_symbol,
          to_symbol: input.to_symbol,
          amount: input.amount,
          chain: input.chain,
          wallet_name: input.wallet_name,
        }, input.preview);
        return `Pending: ${input.preview} — reply YES to confirm or NO to cancel.`;
      }

      case 'buy_crypto': {
        // mp buy takes wallet name and resolves address internally
        const walletName = input.wallet_name || 'ok';
        const data = mp.buy(input.token, input.amount_usd, walletName);
        const url = data?.url ?? data?.checkoutUrl;
        return url
          ? `Checkout link to buy $${input.amount_usd} of ${input.token.toUpperCase()}:\n${url}`
          : JSON.stringify(data);
      }

      case 'create_recipe': {
        const id = uuid();
        recipeOps.create({
          id,
          phone: ctx.phone,
          type: input.type,
          name: input.name,
          config: JSON.stringify(input.config),
          cron_expr: input.cron_expr,
          active: 1,
        });
        return `Recipe created!\nName: "${input.name}"\nType: ${input.type}\nSchedule: ${input.cron_expr}\nID: ${id.slice(0, 8)}`;
      }

      case 'list_recipes': {
        const recipes = recipeOps.list(ctx.phone);
        if (!recipes.length) return 'No active recipes.';
        return recipes.map(r => {
          const cfg = JSON.parse(r.config);
          const last = r.last_run ? new Date(r.last_run * 1000).toLocaleDateString() : 'never';
          return `• ${r.name} [${r.type}] — ${r.cron_expr}\n  ID: ${r.id.slice(0, 8)} | Last: ${last}\n  ${JSON.stringify(cfg)}`;
        }).join('\n\n');
      }

      case 'cancel_recipe': {
        recipeOps.cancel(input.recipe_id, ctx.phone);
        return `Recipe ${input.recipe_id.slice(0, 8)} cancelled.`;
      }

      case 'get_prediction_markets': {
        const provider = input.provider ?? 'polymarket';
        const data = input.query
          ? mp.predict.search(input.query, provider)
          : mp.predict.trending(provider);

        const events: any[] = data?.events ?? data?.items ?? data?.markets ?? [];
        if (!events.length) return 'No markets found.';

        return events.slice(0, 8).map((e: any, i: number) => {
          const market = e.markets?.[0];
          const outcomes = market?.outcomeTokens ?? [];
          const yesToken = outcomes.find((o: any) => o.outcome === 'Yes') ?? outcomes[0];
          const yesPrice = yesToken?.price;
          const provider = e.provider ?? 'polymarket';
          return [
            `${i + 1}. ${e.title ?? e.question}`,
            yesPrice != null ? `   YES: ${(yesPrice * 100).toFixed(0)}¢ | NO: ${((1 - yesPrice) * 100).toFixed(0)}¢` : '',
            `   Provider: ${provider} | tokenId: ${yesToken?.tokenId ?? '?'}`,
          ].filter(Boolean).join('\n');
        }).join('\n\n');
      }

      case 'request_prediction_buy': {
        pendingOps.set(ctx.phone, 'prediction_buy', {
          wallet_name: input.wallet_name,
          provider: input.provider,
          token_id: input.token_id,
          price: input.price,
          size: input.size,
        }, input.preview);
        return `Pending: ${input.preview} — reply YES to confirm or NO to cancel.`;
      }

      case 'get_prediction_positions': {
        const data = mp.predict.positions(input.wallet_addr);
        const positions: any[] = data?.items ?? data?.positions ?? [];
        if (!positions.length) return 'No open positions.';
        return positions.map((p: any) => {
          const pnl = p.unrealizedPnl ?? p.pnl;
          return `• ${p.market?.title ?? p.conditionId}\n  Shares: ${p.shares ?? '?'} | Value: $${p.currentValue?.toFixed(2) ?? '?'} | PnL: ${pnl != null ? `$${pnl.toFixed(2)}` : 'N/A'}`;
        }).join('\n\n');
      }

      case 'create_basket': {
        const id = uuid();
        const assets: BasketAsset[] = input.assets;
        const totalWeight = assets.reduce((s: number, a: BasketAsset) => s + a.weight, 0);
        if (Math.abs(totalWeight - 1.0) > 0.01) {
          return `Weights sum to ${totalWeight.toFixed(2)} — they must sum to 1.0. Adjust and retry.`;
        }
        basketOps.create({
          id,
          phone: ctx.phone,
          name: input.name,
          description: input.description ?? '',
          assets,
          source: 'user',
          template_id: null,
        });
        const legDescriptor = (a: BasketAsset) => {
          if (a.type === 'token') return ` (${a.symbol} on ${a.chain})`;
          if (a.type === 'perp') return ` (${a.perpSide ?? '?'} ${a.perpLeverage ?? 1}x ${a.perpSymbol ?? a.label})`;
          return ' (prediction market)';
        };
        const lines = assets.map((a: BasketAsset) =>
          `  ${(a.weight * 100).toFixed(0)}% ${a.label}${legDescriptor(a)}`
        );
        return `Basket created!\nName: "${input.name}"\nID: ${id.slice(0, 8)}\n\nComposition:\n${lines.join('\n')}`;
      }

      case 'get_basket': {
        const basket = basketOps.get(input.basket_id, ctx.phone)
          ?? basketOps.list(ctx.phone).find(b => b.id.startsWith(input.basket_id))
          ?? curatedBasketOps.list().find(b => b.id === input.basket_id || b.id.startsWith(input.basket_id));
        if (!basket) return `Basket "${input.basket_id}" not found.`;

        type Leg = { label: string; targetPct: number; price: number | null; balance: number | null; value: number | null };
        const legs: Leg[] = [];

        // Optional wallet balances for actual-value computation
        let walletTokens: any[] | null = null;
        if (input.wallet_addr) {
          try {
            const tokenChains = Array.from(new Set(basket.assets
              .filter(a => a.type === 'token' && a.chain)
              .map(a => a.chain!)));
            walletTokens = [];
            for (const chain of tokenChains) {
              const data = mp.token.balances(input.wallet_addr, chain);
              for (const t of (data?.items ?? [])) walletTokens.push({ ...t, _chain: chain });
            }
          } catch { walletTokens = null; }
        }

        for (const asset of basket.assets) {
          if (asset.type === 'token' && asset.address && asset.chain) {
            try {
              const data = mp.token.search(asset.symbol ?? asset.label, asset.chain, 1);
              const token = data?.items?.[0];
              const price = token?.marketData?.price ?? null;
              const held = walletTokens?.find((t: any) =>
                t._chain === asset.chain && (t.address?.toLowerCase() === asset.address?.toLowerCase() || t.symbol === asset.symbol)
              );
              const balance = held?.balance?.formatted != null ? Number(held.balance.formatted) : null;
              const value = held?.balance?.usdValue ?? (price != null && balance != null ? price * balance : null);
              legs.push({ label: asset.label, targetPct: asset.weight * 100, price, balance, value });
            } catch {
              legs.push({ label: asset.label, targetPct: asset.weight * 100, price: null, balance: null, value: null });
            }
          } else if (asset.type === 'prediction' && asset.tokenId && asset.provider) {
            try {
              const positions = input.wallet_addr ? mp.predict.positions(input.wallet_addr) : null;
              const pos = positions?.items?.find((p: any) =>
                p.tokenId === asset.tokenId || p.conditionId === asset.tokenId
              );
              legs.push({
                label: asset.label,
                targetPct: asset.weight * 100,
                price: pos?.currentPrice ?? null,
                balance: pos?.shares ?? null,
                value: pos?.currentValue ?? null,
              });
            } catch {
              legs.push({ label: asset.label, targetPct: asset.weight * 100, price: null, balance: null, value: null });
            }
          } else if (asset.type === 'perp') {
            // Perp valuation not yet wired — surface target only.
            legs.push({ label: asset.label, targetPct: asset.weight * 100, price: null, balance: null, value: null });
          } else {
            legs.push({ label: asset.label, targetPct: asset.weight * 100, price: null, balance: null, value: null });
          }
        }

        const totalValue = legs.reduce((s, l) => s + (l.value ?? 0), 0);

        const lines: string[] = [`Basket: ${basket.name}`];
        if (basket.description) lines.push(`(${basket.description})`);
        lines.push('');

        for (const l of legs) {
          const priceStr = l.price != null ? `$${l.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : 'N/A';
          const valueStr = l.value != null ? ` | value $${l.value.toFixed(2)}` : '';
          const actualPct = totalValue > 0 && l.value != null ? (l.value / totalValue) * 100 : null;
          const driftStr = actualPct != null
            ? ` | actual ${actualPct.toFixed(0)}% (${(actualPct - l.targetPct >= 0 ? '+' : '')}${(actualPct - l.targetPct).toFixed(1)}pp)`
            : '';
          lines.push(`• ${l.label} — target ${l.targetPct.toFixed(0)}% | price ${priceStr}${valueStr}${driftStr}`);
        }

        if (totalValue > 0) lines.push(`\nTotal value: $${totalValue.toFixed(2)}`);
        else if (input.wallet_addr) lines.push(`\nNo holdings detected in wallet for this basket's legs.`);

        return lines.join('\n');
      }

      case 'list_baskets': {
        const baskets = basketOps.list(ctx.phone);
        if (!baskets.length) return 'No baskets saved. Use create_basket to make one, or list_curated_baskets to browse Arc templates.';
        return baskets.map(b => {
          const assetList = b.assets.map(a => `${(a.weight * 100).toFixed(0)}% ${a.label}`).join(', ');
          const forkTag = b.template_id ? ` (forked from ${b.template_id})` : '';
          return `• ${b.name} [ID: ${b.id.slice(0, 8)}]${forkTag}\n  ${b.description || 'No description'}\n  ${assetList}`;
        }).join('\n\n');
      }

      case 'list_curated_baskets': {
        const curated = curatedBasketOps.list();
        if (!curated.length) return 'No curated baskets available yet.';
        return curated.map(b => {
          const assetList = b.assets.map(a => `${(a.weight * 100).toFixed(0)}% ${a.label}`).join(', ');
          return `• ${b.name} [template: ${b.id}]\n  ${b.description}\n  ${assetList}`;
        }).join('\n\n');
      }

      case 'fork_curated_basket': {
        const template = curatedBasketOps.get(input.template_id);
        if (!template) return `Curated template "${input.template_id}" not found. Use list_curated_baskets.`;
        const id = uuid();
        basketOps.create({
          id,
          phone: ctx.phone,
          name: input.name ?? template.name,
          description: template.description,
          assets: template.assets,
          source: 'user',
          template_id: template.id,
        });
        return `Forked "${template.name}" → "${input.name ?? template.name}" (ID: ${id.slice(0, 8)}). It now tracks the curated template; future updates will notify you.`;
      }

      case 'delete_basket': {
        basketOps.delete(input.basket_id, ctx.phone);
        return `Basket ${input.basket_id.slice(0, 8)} deleted.`;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err: any) {
    return `Tool error (${name}): ${err.message}`;
  }
}
