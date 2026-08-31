/**
 * Basket CLI — view and snapshot your asset baskets
 * Usage:
 *   npm run baskets              → list all baskets
 *   npm run baskets -- show 0001 → live price snapshot for a basket
 */
import 'dotenv/config';
import { basketOps } from '../db/client.js';
import { mp } from '../services/nova.js';
import { spawnSync } from 'child_process';

const PHONE   = process.env.TEST_PHONE || '+15550000001';
const MP      = process.env.MP_PATH    || 'mp';

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const GRAY   = '\x1b[90m';

const [,, cmd, arg] = process.argv;

// ── helpers ───────────────────────────────────────────────────────────────────

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function fmt(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toFixed(2)}`;
  return `$${n.toFixed(6)}`;
}

function chgStr(n: number | null): string {
  if (n == null) return `${GRAY}n/a${RESET}`;
  const pct = Math.abs(n) < 1 ? n * 100 : n;
  return pct >= 0
    ? `${GREEN}+${pct.toFixed(2)}%${RESET}`
    : `${RED}${pct.toFixed(2)}%${RESET}`;
}

// ── list ──────────────────────────────────────────────────────────────────────

function cmdList() {
  const baskets = basketOps.list(PHONE);
  if (!baskets.length) {
    console.log(`${GRAY}No baskets found for ${PHONE}${RESET}`);
    console.log(`${DIM}Say "create a basket" in the chat, or run: npm run baskets -- show <id>${RESET}`);
    return;
  }

  console.log(`\n${BOLD}${CYAN}Your Baskets${RESET}  ${GRAY}(run: npm run baskets -- show <id>)${RESET}\n`);
  for (const b of baskets) {
    const shortId = b.id.replace(`basket-`, '').split('-')[0];
    console.log(`${BOLD}${b.name}${RESET}  ${GRAY}id: ${shortId}${RESET}`);
    if (b.description) console.log(`${DIM}  ${b.description}${RESET}`);
    for (const a of b.assets) {
      const pct = (a.weight * 100).toFixed(0).padStart(3);
      console.log(`  ${GRAY}${pct}%${RESET}  ${a.label}`);
    }
    console.log();
  }
}

// ── show (live snapshot) ──────────────────────────────────────────────────────

async function cmdShow(query: string) {
  const baskets = basketOps.list(PHONE);
  const basket = baskets.find(b =>
    b.id.includes(query) ||
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!basket) {
    console.log(`${RED}Basket "${query}" not found.${RESET} Run npm run baskets to list them.`);
    process.exit(1);
  }

  console.log(`\n${BOLD}${CYAN}${basket.name}${RESET}  ${GRAY}${basket.description}${RESET}\n`);

  type Row = { label: string; targetPct: number; price: number | null; chg24h: number | null };
  const rows: Row[] = [];

  for (const asset of basket.assets) {
    if (asset.type === 'token' && asset.symbol && asset.chain) {
      try {
        const result = spawnSync(MP, ['token', 'search', '--query', asset.symbol, '--chain', asset.chain, '--json'], {
          encoding: 'utf8', env: { ...process.env },
        });
        const data = JSON.parse(result.stdout);
        const token = data?.items?.[0];
        rows.push({
          label:     asset.label,
          targetPct: asset.weight * 100,
          price:     token?.marketData?.price ?? null,
          chg24h:    token?.marketData?.priceChangePercent?.['24h'] ?? null,
        });
      } catch {
        rows.push({ label: asset.label, targetPct: asset.weight * 100, price: null, chg24h: null });
      }
    } else {
      rows.push({ label: asset.label, targetPct: asset.weight * 100, price: null, chg24h: null });
    }
  }

  const labelWidth = Math.max(...rows.map(r => r.label.length), 12);

  for (const r of rows) {
    const label  = r.label.padEnd(labelWidth);
    const target = `${r.targetPct.toFixed(0).padStart(3)}%`;
    const prog   = bar(r.targetPct, 16);
    const price  = r.price  != null ? fmt(r.price).padStart(12)  : `${GRAY}$---${RESET}`.padStart(12);
    const chg    = chgStr(r.chg24h);
    console.log(`  ${BOLD}${label}${RESET}  ${GRAY}${target}${RESET} ${GRAY}${prog}${RESET}  ${price}  ${chg}`);
  }

  console.log(`\n${GRAY}Target weights shown. Run 'npm run chat' to trade or rebalance.${RESET}\n`);
}

// ── dispatch ──────────────────────────────────────────────────────────────────

if (!cmd || cmd === 'list') {
  cmdList();
} else if (cmd === 'show' && arg) {
  cmdShow(arg);
} else {
  console.log(`${BOLD}Usage:${RESET}`);
  console.log(`  npm run baskets              — list all baskets`);
  console.log(`  npm run baskets -- show 0001 — live snapshot`);
  console.log(`  npm run baskets -- show "Futures Bucket"`);
}
