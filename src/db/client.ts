import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(__dirname, '../../data');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readStore<T>(name: string, defaultValue: T): T {
  const fp = filePath(name);
  if (!existsSync(fp)) return defaultValue;
  try {
    return JSON.parse(readFileSync(fp, 'utf8')) as T;
  } catch {
    return defaultValue;
  }
}

function writeStore<T>(name: string, data: T): void {
  writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

// ── Types ────────────────────────────────────────────────────────────────────

export type User = {
  phone: string;
  wallet_name: string | null;
  wallet_addr: string | null;
  chain: string;
  risk_profile: string;
  onboarded: number;
  created_at: number;
};

export type Recipe = {
  id: string;
  phone: string;
  type: string;
  name: string;
  config: string;
  cron_expr: string;
  active: number;
  last_run: number | null;
  created_at: number;
};

export type Message = {
  id: number;
  phone: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
};

export type PendingAction = {
  phone: string;
  action_type: string;
  payload: string;
  preview: string;
  created_at: number;
};

export type BasketAsset = {
  type: 'token' | 'prediction' | 'perp';
  label: string;
  weight: number;         // target allocation 0–1
  // token fields
  symbol?: string;
  address?: string;
  chain?: string;
  // prediction market fields
  tokenId?: string;
  provider?: string;
  // perp fields
  perpSymbol?: string;
  perpSide?: 'long' | 'short';
  perpLeverage?: number;
};

export type Basket = {
  id: string;
  phone: string | null;       // null = curated/global template
  name: string;
  description: string;
  assets: BasketAsset[];
  source: 'user' | 'curated';
  template_id: string | null; // when source='user' and forked from a curated template
  created_at: number;
  updated_at: number;
};

export type BasketSnapshot = {
  basket_id: string;
  ts: number;
  total_usd: number | null;
  legs: { label: string; price: number | null; value: number | null; targetPct: number; actualPct: number | null }[];
};

// ── Store accessors ──────────────────────────────────────────────────────────

type UsersStore = Record<string, User>;
type RecipesStore = Recipe[];
type MessagesStore = Record<string, Message[]>;
type PendingStore = Record<string, PendingAction>;
type BasketsStore = Basket[];
type CuratedBasketsStore = Basket[];
type SnapshotsStore = Record<string, BasketSnapshot[]>;

export const userOps = {
  get: (phone: string): User | undefined => {
    const store = readStore<UsersStore>('users', {});
    return store[phone];
  },

  upsert: (phone: string, data: Partial<Omit<User, 'phone' | 'created_at'>>) => {
    const store = readStore<UsersStore>('users', {});
    const existing = store[phone];
    store[phone] = {
      phone,
      wallet_name: existing?.wallet_name ?? null,
      wallet_addr: existing?.wallet_addr ?? null,
      chain: existing?.chain ?? 'solana',
      risk_profile: existing?.risk_profile ?? 'moderate',
      onboarded: existing?.onboarded ?? 0,
      created_at: existing?.created_at ?? Math.floor(Date.now() / 1000),
      ...data,
    };
    writeStore('users', store);
  },
};

export const recipeOps = {
  list: (phone: string): Recipe[] => {
    const store = readStore<RecipesStore>('recipes', []);
    return store.filter(r => r.phone === phone && r.active === 1);
  },

  listAll: (): Recipe[] => {
    return readStore<RecipesStore>('recipes', []).filter(r => r.active === 1);
  },

  create: (recipe: Omit<Recipe, 'last_run' | 'created_at'>) => {
    const store = readStore<RecipesStore>('recipes', []);
    store.push({ ...recipe, last_run: null, created_at: Math.floor(Date.now() / 1000) });
    writeStore('recipes', store);
  },

  cancel: (id: string, phone: string) => {
    const store = readStore<RecipesStore>('recipes', []);
    const recipe = store.find(r => r.id === id && r.phone === phone);
    if (recipe) recipe.active = 0;
    writeStore('recipes', store);
  },

  markRan: (id: string) => {
    const store = readStore<RecipesStore>('recipes', []);
    const recipe = store.find(r => r.id === id);
    if (recipe) recipe.last_run = Math.floor(Date.now() / 1000);
    writeStore('recipes', store);
  },
};

export const messageOps = {
  save: (phone: string, role: 'user' | 'assistant', content: string) => {
    const store = readStore<MessagesStore>('messages', {});
    if (!store[phone]) store[phone] = [];
    const id = store[phone].length + 1;
    store[phone].push({ id, phone, role, content, created_at: Math.floor(Date.now() / 1000) });
    // Keep only last 50 messages per user
    if (store[phone].length > 50) store[phone] = store[phone].slice(-50);
    writeStore('messages', store);
  },

  recent: (phone: string, limit = 12): Message[] => {
    const store = readStore<MessagesStore>('messages', {});
    const msgs = store[phone] ?? [];
    return msgs.slice(-limit);
  },
};

export const pendingOps = {
  set: (phone: string, action_type: string, payload: object, preview: string) => {
    const store = readStore<PendingStore>('pending', {});
    store[phone] = {
      phone,
      action_type,
      payload: JSON.stringify(payload),
      preview,
      created_at: Math.floor(Date.now() / 1000),
    };
    writeStore('pending', store);
  },

  get: (phone: string): PendingAction | undefined => {
    const store = readStore<PendingStore>('pending', {});
    return store[phone];
  },

  clear: (phone: string) => {
    const store = readStore<PendingStore>('pending', {});
    delete store[phone];
    writeStore('pending', store);
  },
};

export const basketOps = {
  list: (phone: string): Basket[] => {
    return readStore<BasketsStore>('baskets', []).filter(b => b.phone === phone);
  },

  listAll: (): Basket[] => {
    return readStore<BasketsStore>('baskets', []);
  },

  get: (id: string, phone: string): Basket | undefined => {
    return readStore<BasketsStore>('baskets', []).find(b => b.id === id && b.phone === phone);
  },

  create: (basket: Omit<Basket, 'created_at' | 'updated_at'>) => {
    const store = readStore<BasketsStore>('baskets', []);
    const now = Math.floor(Date.now() / 1000);
    store.push({ ...basket, created_at: now, updated_at: now });
    writeStore('baskets', store);
  },

  update: (id: string, phone: string, assets: BasketAsset[]) => {
    const store = readStore<BasketsStore>('baskets', []);
    const basket = store.find(b => b.id === id && b.phone === phone);
    if (basket) {
      basket.assets = assets;
      basket.updated_at = Math.floor(Date.now() / 1000);
    }
    writeStore('baskets', store);
  },

  delete: (id: string, phone: string) => {
    const store = readStore<BasketsStore>('baskets', []);
    writeStore('baskets', store.filter(b => !(b.id === id && b.phone === phone)));
  },
};

export const curatedBasketOps = {
  list: (): Basket[] => {
    return readStore<CuratedBasketsStore>('curated_baskets', []);
  },

  get: (templateId: string): Basket | undefined => {
    return readStore<CuratedBasketsStore>('curated_baskets', []).find(b => b.id === templateId);
  },
};

export const snapshotOps = {
  // Keep last N snapshots per basket to bound storage.
  append: (snapshot: BasketSnapshot, keep = 720) => {
    const store = readStore<SnapshotsStore>('basket_snapshots', {});
    const list = store[snapshot.basket_id] ?? [];
    list.push(snapshot);
    if (list.length > keep) list.splice(0, list.length - keep);
    store[snapshot.basket_id] = list;
    writeStore('basket_snapshots', store);
  },

  recent: (basketId: string, limit = 48): BasketSnapshot[] => {
    const store = readStore<SnapshotsStore>('basket_snapshots', {});
    const list = store[basketId] ?? [];
    return list.slice(-limit);
  },
};
