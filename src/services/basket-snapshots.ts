import cron from 'node-cron';
import { basketOps, curatedBasketOps, snapshotOps, type Basket, type BasketSnapshot } from '../db/client.js';
import { mp } from './moonpay.js';

type LegValue = BasketSnapshot['legs'][number];

export function valueBasket(basket: Basket): BasketSnapshot {
  const legs: LegValue[] = basket.assets.map(asset => {
    let price: number | null = null;
    if (asset.type === 'token' && asset.symbol && asset.chain) {
      try {
        const data = mp.token.search(asset.symbol, asset.chain, 1);
        price = data?.items?.[0]?.marketData?.price ?? null;
      } catch {
        price = null;
      }
    }
    return {
      label: asset.label,
      price,
      value: null,
      targetPct: asset.weight * 100,
      actualPct: null,
    };
  });

  return {
    basket_id: basket.id,
    ts: Math.floor(Date.now() / 1000),
    total_usd: null,
    legs,
  };
}

function snapshotAll() {
  const baskets: Basket[] = [...curatedBasketOps.list(), ...basketOps.listAll()];
  let ok = 0;
  for (const b of baskets) {
    try {
      snapshotOps.append(valueBasket(b));
      ok++;
    } catch (err: any) {
      console.error(`[snapshots] failed for ${b.id}: ${err.message}`);
    }
  }
  console.log(`[snapshots] wrote ${ok}/${baskets.length} basket snapshots`);
}

export function startSnapshotWriter() {
  // Hourly on the hour. Cheap: only fetches per-symbol price.
  cron.schedule('0 * * * *', snapshotAll);
  console.log('[snapshots] writer scheduled hourly');
}
