/**
 * Interactive terminal chat — full Claude + Nova stack, no Sendblue needed.
 * Usage: npm run chat
 */
import 'dotenv/config';
import readline from 'readline';
import { processMessage } from '../services/claude.js';
import { userOps, recipeOps, messageOps, basketOps } from '../db/client.js';
import { spawnSync } from 'child_process';

const TEST_PHONE = process.env.TEST_PHONE || '+15550000001';
const MP = process.env.MP_PATH || 'mp';

const RESET  = '\x1b[0m';
const DIM    = '\x1b[2m';
const BOLD   = '\x1b[1m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const GRAY   = '\x1b[90m';

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

async function main() {
  console.clear();
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}${CYAN}  🌙  Poke  —  crypto AI in iMessage  ${RESET}`);
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);

  // ── Preflight checks ────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.log(`${RED}✗  No AI key found. Add GROQ_API_KEY (free at groq.com) to .env${RESET}`);
    process.exit(1);
  }
  const provider = process.env.GROQ_API_KEY ? 'Groq (llama-3.3-70b)' : 'Anthropic (Claude)';
  console.log(`${GREEN}✓  AI:${RESET}      ${provider}`);

  // NOTE: MP points at a real third-party crypto CLI (see src/services/nova.ts)
  const mpCheck = spawnSync(MP, ['user', 'retrieve', '--json'], {
    encoding: 'utf8',
    env: { ...process.env },
  });
  if (mpCheck.status === 0) {
    try {
      JSON.parse(mpCheck.stdout);
      console.log(`${GREEN}✓  Nova:${RESET} logged in`);
    } catch {
      console.log(`${GREEN}✓  Nova:${RESET} CLI ready`);
    }
  } else {
    console.log(`${YELLOW}⚠  Nova:${RESET} not authenticated`);
    console.log(`${GRAY}   Run: mp login   then restart chat${RESET}`);
  }

  const user = userOps.get(TEST_PHONE);
  if (user?.wallet_name) {
    console.log(`${GREEN}✓  Wallet:${RESET}  ${user.wallet_name} (${user.chain})`);
  }

  console.log(`${GRAY}   /status  /clear  /recipes  /baskets  /quit${RESET}`);
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  // ── Readline setup ───────────────────────────────────────────────────────
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: `${BOLD}you:${RESET}  `,
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const text = line.trim();
    if (!text) { rl.prompt(); return; }

    // ── Slash commands ─────────────────────────────────────────────────────
    if (text === '/quit' || text === '/exit') {
      console.log(`\n${DIM}bye${RESET}\n`);
      process.exit(0);
    }

    if (text === '/clear') {
      console.clear();
      rl.prompt();
      return;
    }

    if (text === '/status') {
      const u = userOps.get(TEST_PHONE);
      console.log(`\n${DIM}${JSON.stringify(u, null, 2)}${RESET}\n`);
      rl.prompt();
      return;
    }

    if (text === '/recipes') {
      const recipes = recipeOps.list(TEST_PHONE);
      if (!recipes.length) {
        console.log(`\n${DIM}No active recipes.${RESET}\n`);
      } else {
        console.log('');
        recipes.forEach(r => {
          const cfg = JSON.parse(r.config);
          console.log(`${BOLD}${r.name}${RESET} ${DIM}[${r.type}] ${r.cron_expr}${RESET}`);
          console.log(`${GRAY}  ${JSON.stringify(cfg)}${RESET}`);
        });
        console.log('');
      }
      rl.prompt();
      return;
    }

    if (text === '/baskets') {
      const baskets = basketOps.list(TEST_PHONE);
      if (!baskets.length) {
        console.log(`\n${DIM}No baskets. Say "create a basket" to make one.${RESET}\n`);
      } else {
        console.log('');
        baskets.forEach(b => {
          console.log(`${BOLD}${b.name}${RESET} ${DIM}[${b.id.slice(0, 12)}]${RESET}`);
          console.log(`${GRAY}  ${b.description || 'No description'}${RESET}`);
          b.assets.forEach(a => {
            console.log(`${GRAY}  ${(a.weight * 100).toFixed(0)}%  ${a.label}${RESET}`);
          });
          console.log('');
        });
      }
      rl.prompt();
      return;
    }

    if (text === '/history') {
      const msgs = messageOps.recent(TEST_PHONE, 20);
      console.log('');
      msgs.forEach(m => {
        const label = m.role === 'user' ? `${BOLD}you${RESET}` : `${CYAN}poke${RESET}`;
        console.log(`${label}: ${m.content.slice(0, 120)}`);
      });
      console.log('');
      rl.prompt();
      return;
    }

    // ── Send to Claude ─────────────────────────────────────────────────────
    process.stdout.write(`\n${CYAN}poke:${RESET} ${DIM}thinking...${RESET}`);

    try {
      const reply = await processMessage(TEST_PHONE, text);
      clearLine();
      console.log(`${CYAN}poke:${RESET}  ${reply}\n`);
    } catch (err: any) {
      clearLine();
      const detail = err?.error?.message ?? err?.message ?? String(err);
      console.log(`${RED}error ${err?.status ?? ''}:${RESET} ${detail}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(`\n${DIM}bye${RESET}\n`);
    process.exit(0);
  });
}

main();
