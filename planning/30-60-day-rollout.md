# Arc — 30/60-day rollout plan

**Owner:** [REDACTED] (Product) · **Last updated:** 2026-05-22 · **Drafted from:** an internal rebrand deck (p9 LOE ranking, p10 4–6 week gameplan) + baskets scope in this repo.

This plan *extends* the deck's 4–6 week gameplan into a 30/60-day rollout — it does not contradict it. Day 0 = launch trigger on the rebrand visual + comms.

---

## Goals & success metrics

By **Day 30** (launch + 2 weeks):
- Arc visible publicly (site, X handle, email #1 sent to 250K).
- Curated baskets live (Made in America, AI Infrastructure) — read-only catalog OK; one-tap buy is stretch.
- ≥ 5% open + ≥ 0.5% reactivation rate on email #1.
- Cross-chain swap path live in product (not necessarily exposed in baskets yet).

By **Day 60**:
- Auto-rebalance (drift-only trigger) live for forked curated baskets.
- NLP "theme → basket" in private beta to ≤ 1K users.
- Re-engagement funnel hit ≥ 2% trade conversion (of reactivated users).
- Perps + prediction markets browseable; basket-leg integration deferred to v1.2.

Tracked weekly; deck-promised 4–6 wk milestones map to Days 0–42 below.

---

## Six features, sequenced by LOE & dependency

Recap from deck p9:

| # | Feature | LOE | Dependency |
|---|---|---|---|
| 1 | Cross-Chain Integration | Low | None |
| 2 | NLP Purchasing | Low–Med | None for v1; benefits from Agent Co-Pilot |
| 3 | Agent Co-Pilot | Medium | Needs research + news pipeline |
| 4 | Perps & Prediction Markets | Medium | None — provider integration |
| 5 | Baskets | High | #1 for cross-chain; #3 for narrative; #4 for perp legs |
| 6 | Agentic Rebalancing | High | #3 for macro triggers; #5 for executor |

---

## Days 0–14 (deck: Foundation, weeks 1–2)

### Brand & comms
- **D0–D3**: Visual rebrand shipped — domain redirects, app icon, in-app brand, deck v-final, X handle migrated/launched.
- **D2–D5**: Comms strategy for the 250K cohort approved (Legal + Brand + Growth). Draft email #1 + landing page.
- **D5–D10**: ESP setup confirmed (see `email-outreach-plan.md`), suppression list pulled from Nova CRM, segmentation rules agreed.
- **D10**: Soft re-engagement to a 5% holdout (random 12.5K of 250K) — read the open/click/reply rates before the full send.
- **D14**: First production send to the remaining 237.5K, gated on holdout signals.

### Product
- **D0–D7**: Land [v1 baskets code] currently in this PR — schema (perp/source/template_id), drift in `get_basket`, curated catalog (Made in America + AI Infrastructure), hourly snapshot writer. Already shipped in this branch.
- **D7–D14**: `buy_basket` orchestrator MVP — single-chain only (Solana), N-leg swap with one confirmation, persisted intent for crash resume. Spec in `baskets-scope §3.3`.
- **D7–D14**: Cross-chain swap path live in product chat flow (uses existing `mp token bridge`); not yet wired into baskets.

### Go/no-go gates → Day 14
- ✅ Brand assets shipped without comms incidents.
- ✅ Holdout email #1 ≥ 4% open / ≥ 0.3% click (below = pause + iterate).
- ✅ Curated catalog + drift computation visible in beta build.

---

## Days 15–28 (deck: Integration, weeks 3–4)

### Product
- **D15–D21**: Agent Co-Pilot MVP — NLP intent → tool routing (uses existing `src/tools/index.ts` Claude tool set). Research surface: news + price + on-chain signals available to the agent.
- **D15–D21**: Sandbox testing with Raydium pool depth for xStock legs (deck explicit). Confirm liquidity budgets per basket entry size.
- **D18–D25**: `buy_basket` exposed in chat flow behind a feature flag, restricted to internal team + 50 alpha users.
- **D21–D28**: Cross-chain integration completes — basket-aware: `buy_basket` can route a non-Solana leg through `mp token bridge`.
- **D25–D28**: Drift-based rebalance recipe — adds `'rebalance'` type to `recipes/engine.ts` dispatcher. Default: notify, not auto-execute. Threshold: any leg > 7pp off target, weekly check.

### Go/no-go gates → Day 28
- ✅ ≥ 50 alpha users have funded at least one basket end-to-end without manual intervention.
- ✅ Cross-chain swap completion rate ≥ 95% across a 100-tx sample.
- ✅ Rebalance recipe runs in dry-run for 7 days without false triggers.

---

## Days 29–42 (deck: Launch, weeks 5–6)

### Distribution
- **D29–D32**: Email #2 — "Your AI just built you a basket". Segmented:
  - **A (Reactivated trader, ≥ 1 trade since email #1)**: deep-link into Agent Co-Pilot prompt with their last-traded asset.
  - **B (Opened but no trade)**: invite to fork "Made in America" with a one-click checkout pre-fill.
  - **C (Did not open #1)**: subject-line A/B retry.
- **D32–D35**: Public X launch with Agent Co-Pilot demo videos (basket-from-theme, drift alerts). See `x-social-plan.md` for content calendar.
- **D35**: Press / influencer outreach (CT inner ring, fintech press).

### Product
- **D29–D35**: NLP basket assembly behind beta flag (asset universe = Nova-routable allowlist).
- **D32–D38**: Auto-rebalance mode (opt-in per basket) enabled on drift trigger.
- **D38–D42**: Performance history surface — snapshot writer (already shipped) drives a `/basket/:id/perf` endpoint and chat surface.

### Go/no-go gates → Day 42
- ✅ Email #2 ≥ 12% open, ≥ 1.5% trade conversion (of opens).
- ✅ Rebalance auto-execute has ≥ 99% success rate on the alpha cohort.
- ✅ < 0.5% bug-rate on basket buy (refund/credit incidents).

---

## Days 43–60 (post-deck extension)

### Product
- **D43–D49**: Perps & Prediction Markets standalone surface (browse + trade), basket-leg integration deferred.
- **D49–D55**: Macro-event rebalance trigger — Agent Co-Pilot detects Fed events, earnings calendar, on-chain signals → proposes rebalance (notify mode).
- **D55–D60**: Curated basket v2 release — 2 new themes informed by 30-day usage data (likely candidates: Defense, Stablecoin Yield, Energy).

### Distribution
- **D43**: Email #3 — perf recap for users who funded a basket ("Your Made in America basket is +6.2%"). Driven by snapshot history.
- **D50**: Re-engagement to the silent cohort with a different value prop (Agent Co-Pilot screenshot, not basket pitch).
- **D55–D60**: Paid acquisition test — small ($25K–$50K) spend on X + Reddit, vertical: TradFi-curious crypto-natives.

### Go/no-go for "GA" past Day 60
- DAU ≥ 8K (3.2% of 250K cohort).
- Basket retention: ≥ 40% of basket-funders still holding ≥ 1 leg at D60.
- NLP basket assembly NPS ≥ +20 in private beta.

---

## Workstreams in parallel (always-on)

- **Legal/Compliance** — sign-off on "+X% backtest" framing; xStock region restrictions (`baskets-scope §5.7`); auto-rebalance disclosure.
- **Support** — onboarding scripts for the reactivated cohort (KYC re-completion, wallet recovery).
- **Data** — define event schema for: basket created, basket funded, rebalance triggered/executed/aborted, NLP basket suggested/accepted.
- **Security** — `buy_basket` orchestrator gets a per-basket lock + intent log; pen-test before opening up to all 250K.

---

## Risks → mitigations

| Risk | Mitigation |
|---|---|
| KYC re-friction for the 250K cohort kills funnel | First email = no-CTA-required content; KYC re-prompt only at buy-time, with white-glove support path |
| Auto-rebalance generates surprise tax events | Default = notify; per-basket auto toggle off; "tax-aware mode" surface in v1.5 |
| Backtest numbers ("+139%") trigger regulator scrutiny | Re-frame to "since-curation" tracked from D0 once snapshot data exists; backtests labeled clearly |
| xStock liquidity caves under reactivation burst | Per-leg max buy floor in `buy_basket`; soft-cap launch cohort (e.g. roll out to 25K/day rather than full 250K) |
| Cross-chain bridge failure mid `buy_basket` | Resumable intent ledger (already in scope); abort threshold + auto-refund path |
| Two rebalance triggers race-condition | Per-basket lock (`baskets-scope §3.5`) |

---

## Decisions still open

These should be locked by D7 or the plan slips:

1. **Asset universe v1**: tokens + xStocks + Polymarket only? (Recommended.) Perps after D43.
2. **Perp provider** when added: Hyperliquid? Pacifica? (Recommended: Hyperliquid for liquidity + repo already has `perp-trade` skill.)
3. **Rebalance default**: notify in v1, auto opt-in in v1.1. (Recommended.)
4. **Min $20 USDC**: hard floor v1. (Recommended.)
5. **Backtest data source**: do we have 1–3y price history for the xStocks? If not, drop projected returns from launch comms.
6. **External wallets**: Nova-managed only v1; connect-wallet in v2.
7. **Region restrictions** on xStocks for the US cohort — Legal answer needed by D14.

---

## What's already in the repo (status at draft time)

- ✅ Basket schema (perp + curated + template_id) — `src/db/client.ts`
- ✅ Drift computation in `get_basket` — `src/tools/index.ts`
- ✅ Curated catalog data + tools — `data/curated_baskets.json`, `list_curated_baskets`, `fork_curated_basket`
- ✅ Hourly snapshot writer — `src/services/basket-snapshots.ts`, wired in `src/index.ts`
- ⏳ `buy_basket` orchestrator — designed in `baskets-scope §3.3`, not built
- ⏳ Rebalance recipe — designed, not built
- ⏳ NLP basket assembly — pending Agent Co-Pilot
