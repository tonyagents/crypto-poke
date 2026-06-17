import { spawnSync } from 'child_process';

const MP = process.env.MP_PATH || 'mp';

function run(args: string[]): any {
  const result = spawnSync(MP, [...args, '--json'], {
    encoding: 'utf8',
    env: { ...process.env },
    timeout: 30_000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'mp command failed');
  }
  return JSON.parse(result.stdout);
}

export const mp = {
  // ── Wallets ──────────────────────────────────────────────────────────────
  wallets: {
    list: () => run(['wallet', 'list']),
    retrieve: (name: string) => run(['wallet', 'retrieve', '--name', name]),
  },

  // ── Tokens ───────────────────────────────────────────────────────────────
  token: {
    search: (query: string, chain: string, limit = 5) =>
      run(['token', 'search', '--query', query, '--chain', chain, '--limit', String(limit)]),

    // --token <address>, not --address
    retrieve: (address: string, chain: string) =>
      run(['token', 'retrieve', '--token', address, '--chain', chain]),

    // requires --page
    trending: (chain: string, limit = 10, page = 1) =>
      run(['token', 'trending', 'list', '--chain', chain, '--limit', String(limit), '--page', String(page)]),

    // --token <address>, not --address
    check: (address: string, chain: string) =>
      run(['token', 'check', '--token', address, '--chain', chain]),

    balances: (walletAddr: string, chain: string) =>
      run(['token', 'balance', 'list', '--wallet', walletAddr, '--chain', chain]),

    quote: (fromToken: string, toToken: string, fromAmount: string, fromChain: string, toChain?: string) =>
      run([
        'token', 'quote',
        '--from-chain', fromChain,
        '--from-token', fromToken,
        '--from-amount', fromAmount,
        '--to-chain', toChain || fromChain,
        '--to-token', toToken,
      ]),

    swap: (wallet: string, chain: string, fromToken: string, toToken: string, fromAmount: string) =>
      run([
        'token', 'swap',
        '--wallet', wallet,
        '--chain', chain,
        '--from-token', fromToken,
        '--from-amount', fromAmount,
        '--to-token', toToken,
      ]),

    bridge: (wallet: string, fromChain: string, toChain: string, fromToken: string, toToken: string, amount: string) =>
      run([
        'token', 'bridge',
        '--wallet', wallet,
        '--from-chain', fromChain,
        '--to-chain', toChain,
        '--from-token', fromToken,
        '--from-amount', amount,
        '--to-token', toToken,
      ]),
  },

  // ── Buy (fiat on-ramp) ───────────────────────────────────────────────────
  buy: (token: string, amount: string, wallet: string) =>
    run(['buy', '--token', token, '--amount', amount, '--wallet', wallet]),

  // ── Prediction Markets ───────────────────────────────────────────────────
  predict: {
    trending: (provider = 'polymarket', limit = 10, page = 1) =>
      run(['prediction-market', 'market', 'trending', 'list', '--provider', provider, '--limit', String(limit), '--page', String(page)]),

    search: (query: string, provider = 'polymarket', limit = 10) =>
      run(['prediction-market', 'market', 'search', '--query', query, '--provider', provider, '--limit', String(limit), '--page', '1']),

    positions: (walletAddr: string) =>
      run(['prediction-market', 'position', 'list', '--wallet', walletAddr, '--status', 'open']),

    // provider: 'polymarket' | 'kalshi'
    // tokenId: outcome token ID from search results
    // price: 0–1 (e.g. 0.65 = 65 cents per share)
    // size: number of shares (each pays $1 if outcome wins)
    buyPosition: (walletName: string, provider: string, tokenId: string, price: string, size: string) =>
      run([
        'prediction-market', 'position', 'buy',
        '--wallet', walletName,
        '--provider', provider,
        '--tokenId', tokenId,
        '--price', price,
        '--size', size,
      ]),

    pnl: (walletAddr: string) =>
      run(['prediction-market', 'pnl', 'retrieve', '--wallet', walletAddr]),
  },

  // ── Wallet Activity / PnL ────────────────────────────────────────────────
  activity: (walletAddr: string, chain: string, limit = 20) =>
    run(['wallet', 'activity', 'list', '--wallet', walletAddr, '--chain', chain, '--limit', String(limit)]),

  pnl: (walletAddr: string, chain: string) =>
    run(['wallet', 'pnl', 'retrieve', '--wallet', walletAddr, '--chain', chain]),

  // ── User ─────────────────────────────────────────────────────────────────
  user: () => run(['user', 'retrieve']),
};

// Resolve symbol → { address, symbol, name } via search
export function resolveToken(symbolOrAddr: string, chain: string): { address: string; symbol: string; name: string } | null {
  if (symbolOrAddr.length > 20 && !symbolOrAddr.includes(' ')) {
    return { address: symbolOrAddr, symbol: symbolOrAddr.slice(0, 8), name: symbolOrAddr };
  }
  try {
    const result = mp.token.search(symbolOrAddr, chain, 1);
    const token = result?.items?.[0];
    if (!token) return null;
    return { address: token.address, symbol: token.symbol, name: token.name };
  } catch {
    return null;
  }
}
