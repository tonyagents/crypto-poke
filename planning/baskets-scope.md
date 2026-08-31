# Baskets — scope

Drafted against an internal rebrand deck and the current repo.

---

## 1. What ships today

**Data model** (`src/db/client.ts`)
- `Basket { id, phone, name, description, assets[], source, template_id, created_at, updated_at }`
- `BasketAsset.type ∈ { 'token', 'prediction', 'perp' }`. Tokens carry `{ symbol, address, chain }`; predictions carry `{ tokenId, provider }`; perps carry `{ perpSymbol, perpSide, perpLeverage }`.
- Storage = JSON file (`data/baskets.json`). Curated catalog in `data/curated_baskets.json`. Snapshots in `data/basket_snapshots.json`.

**Tools exposed to Claude** (`src/tools/index.ts`)
- `create_basket` (validates weights ≈ 1.0, stamps `source: 'user'`)
- `get_basket` — computes balance × price per leg, total value, actual %, drift in pp vs target. Resolves curated templates too.
- `list_baskets`, `list_curated_baskets`, `fork_curated_basket`, `delete_basket`
- Not yet: `rebalance_basket`, `buy_basket`, `update_basket`.

**CLI** (`src/cli/baskets.ts`)
- `npm run baskets` list / `-- show <id>` snapshot. Read-only.

**Fixtures** (`data/baskets.json`)
- 4 user-scoped templates (Futures Bucket, Big Tech xStocks, Index Trackers, L1 Blue Chips). All Solana. One prediction slot via Polymarket.

**Curated catalog** (`data/curated_baskets.json`)
- 2 templates: "Made in America" (8 xStocks), "AI Infrastructure" (compute-weighted xStocks + SOL/ETH tail).

**Execution**
- `buy_crypto` in tools handles a single token via `mp buy` (fiat onramp → wallet). **No code path that buys an entire basket.**
- `request_swap` exists but only one leg at a time; user must reply `YES` per pending action.

**Rebalancing**
- `src/recipes/engine.ts` dispatches `dca` and `alert` recipe types only. No `rebalance` type. No drift-trigger executor.

**Snapshot writer**
- `src/services/basket-snapshots.ts` writes hourly basket snapshots (`snapshotOps`), bounded to 720 entries/basket. Wired into `src/index.ts` startup.

---

## 2. Gap vs. the deck

The deck promises seven things baskets must do. State today:

| Capability (deck) | Today | Gap |
|---|---|---|
| Curated narrative baskets (Made in America, AI Infra) | 2 templates seeded, `fork_curated_basket` works | Admin UX for publishing/updating templates; opt-in mirror-on-update |
| xStocks + tokens + prediction markets unified | Schema supports all three | Pricing/value for prediction leg only works if wallet passed; shares are integer, not dollar-weighted |
| Perps in baskets | Schema supports it, valuation does not | Need perp provider client + position/PnL feed |
| Cross-chain | Fixtures Solana-only; schema allows `chain` per asset | No bridge orchestration in `buy_basket` (which doesn't exist); user model has single `chain` (`db/client.ts:114`) |
| One-tap fiat → on-chain basket | Single-token onramp only | N-leg orchestration: onramp USDC → split → per-chain swap → bridge → predict.buy → (perp open) |
| Auto-rebalance on macro events | Drift computed in `get_basket`; no triggers, no executor | Trigger types (drift/macro/event/calendar), rebalance executor, threshold gating |
| NLP "theme → basket" assembly | `create_basket` is callable by Claude, no narrative flow | Needs Agent Co-Pilot + asset universe selector + (optionally) projected-return model |
| Min $20 USDC | Not enforced | Floor check; sub-$20 mode (round-up or asset-skip) |
| "+139%" performance numbers in basket cards | Hourly snapshot writer running; no chart endpoint yet | Snapshot reader + perf surface; or backtest model for projections |

---

## 3. Engineering work breakdown

Sized rough: **S = <3d, M = <2w, L = >2w**.

### 3.1 Data model ✅ shipped
- `'perp'` asset type with perp fields.
- `source: 'user' | 'curated'`, `template_id`, `phone: string | null`.
- `BasketSnapshot { basket_id, ts, total_usd, legs[] }`.
- Existing fixtures defaulted to `source: 'user'`.

### 3.2 Valuation & drift ✅ shipped (token + prediction legs)
- `get_basket` per-leg balance lookup × price → `actualPct`; computes `drift = actualPct - targetPct`.
- Predict leg uses `mp.predict.positions`.
- **Perp leg still TBD** — needs perp provider position feed.

### 3.3 Buy-basket orchestration (M) — not started
- New tool `buy_basket(basket_id, amount_usd, wallet_name)`:
  1. Onramp `amount_usd` → USDC on a "home chain" (configurable per-basket; default Solana for xStock-heavy baskets, Ethereum/Base for non-Solana).
  2. Split USDC by target weights.
  3. Per leg: same-chain swap (`mp.token.swap`), cross-chain bridge (`mp.token.bridge`), or `mp.predict.buyPosition`, or perp open.
  4. Idempotent + resumable: persist intent (`PendingBasketBuy { id, steps[], status_per_step }`) so a crash mid-flight resumes.
  5. Slippage + max-gas limits per leg with overall abort threshold.
- Confirmation UX: single "Buying basket X — N legs, est total $A, max fees $B" → one `YES`. Per-leg confirmations would be unusable.

### 3.4 Curated catalog ✅ partially shipped
- ✅ `data/curated_baskets.json` + `curatedBasketOps`.
- ✅ `list_curated_baskets`, `fork_curated_basket` tools.
- ⏳ Admin script to publish/update templates.
- ⏳ Mirror-on-update flow for forked baskets (notify-then-confirm).

### 3.5 Rebalance engine (M) — not started
- Add `recipe.type = 'rebalance'` to `recipes/engine.ts` dispatcher.
- Triggers in v1: scheduled (weekly cron) + drift-threshold (any leg >X% off target).
- v1.5 triggers: macro event (deferred until Agent Co-Pilot lands), earnings calendar, curated-template update.
- Executor: compute deltas → emit swap/bridge ops → reuse buy-basket orchestrator.
- Min-rebalance threshold ($ and %) to avoid churn / gas waste.
- Notify-then-confirm mode + fully-auto mode (per-basket flag); v1 default = notify.

### 3.6 NLP "theme → basket" (M, depends on Agent Co-Pilot)
- New recipe: prompt Claude with `{ theme, risk_profile, amount_usd, asset_universe }` → returns `assets[]` with weights + rationale.
- Asset universe = whitelist of Nova-routable tokens/xStocks/perp markets, refreshed nightly.
- Optional projection model: deck shows "+65.3% annual" — needs either a backtest of weighted historical returns (data: 1–3y for xStocks via what source?) or a clearly-labeled "scenario" framing. **Flag legal review.**

### 3.7 Performance history ✅ writer shipped
- ✅ Hourly snapshot writer running (`src/services/basket-snapshots.ts`).
- ⏳ Endpoint / tool returns `{ 1d, 7d, 30d, since_inception }` change.
- ⏳ For curated baskets, snapshots are global (one writer per template) not per-user — already implemented since curated baskets have stable IDs.

### 3.8 Wallet model for cross-chain (S) — not started
- Drop `user.chain` as a single value (`db/client.ts:114`); read per-chain addresses on demand via `mp.wallets.retrieve(name)` which already returns Solana + Ethereum. Add caching since this is called a lot.

---

## 4. Edge cases & risks

- **xStocks liquidity**: low TVL on smaller names → high slippage on $20 entries. Mitigation: per-asset min-buy floor or route to a different leg.
- **xStocks are Solana-only today** (Nova's routing). A "cross-chain basket" with xStocks still funnels through Solana. Document this; the deck implies full chain choice.
- **Prediction markets are integer shares.** Can't dollar-weight precisely. Mitigation: round to nearest share + display "approx X%".
- **Perps carry liquidation risk**. Cannot quietly include in low-risk baskets. Mitigation: explicit risk tier per basket; perp legs gated.
- **Rebalance churn = tax events + gas.** Min thresholds critical. Likely need a "tax-aware off" toggle (US users).
- **KYC gates on the 250K cohort.** Many NovaGate users may not have completed full KYC for fiat onramp; basket buy flow needs a graceful "complete KYC" fork.
- **Projected returns are regulatorily fraught.** Anything resembling "+65.3% annual" needs Compliance sign-off; default to "backtest, not a forecast" framing.
- **Concurrency**: two rebalance triggers firing in parallel for the same basket would double-trade. Need per-basket lock.
- **Recipe engine restart**: today `recipes/engine.ts` `startRecipeEngine` runs at boot — fine — but a partial rebalance interrupted mid-flight needs replay; the resumable intent in 3.3 covers this.

---

## 5. Open questions (need your call)

1. **Asset universe for v1.** Tokens + xStocks + Polymarket + perps, or hold perps for v2?
2. **Perp provider.** Hyperliquid / Pacifica / Lighter / Aster? Repo has a `perp-trade` skill — does that imply a preferred one?
3. **Rebalance default.** Notify-then-confirm or auto-execute in v1? Per-basket override?
4. **Min $20 USDC**: hard floor for v1, or aspirational?
5. **Curated basket editability.** Read-only catalog, or forkable + user-editable? (Today: forkable.)
6. **Backtest data source.** What feeds the "+139%" numbers? If we don't have it, the cards need a different framing.
7. **Region restrictions** on xStocks (some xStocks aren't available US-side via certain rails).
8. **Custody.** Nova-managed wallet only, or connect external (Phantom, MetaMask)?

---

## 6. Dependencies on the rest of the roadmap

| Basket capability | Blocked by |
|---|---|
| Cross-chain baskets | **Feature #1 Cross-Chain Integration** (Low LOE) — bridge orchestration |
| NLP "theme → basket" | **Feature #2 NLP Purchasing** + **#3 Agent Co-Pilot** |
| Perps leg | **Feature #4 Perps & Prediction** |
| Macro-event rebalance triggers | **#3 Agent Co-Pilot** (news/filings monitor) |
| One-tap fiat checkout | None blocking; `mp buy` already works — needs orchestration layer |
| Drift/value/snapshot/curated | ✅ Already shipped |

---

## 7. Recommended slicing

- **v1 (D0–D14):** ✅ valuation/drift, ✅ curated catalog, ✅ perf snapshots. Still to do: `buy_basket` orchestration single-chain (3.3 minus bridge). No perps, no cross-chain, no auto-rebalance. Manual "rebalance now" button via existing swap flow.
- **v1.1 (D15–D28):** Cross-chain in buy-basket (depends on #1), rebalance recipe with drift trigger only (3.5).
- **v1.2 (D29–D60):** NLP theme → basket (depends on #3), macro-event triggers, perps leg (depends on #4).

This slicing keeps the Cesto-comparison wins (curated narratives + xStocks + Nova checkout) in v1 and pushes the high-LOE agentic claims to v1.1+.
