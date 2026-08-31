# Arc — Go-to-Market One-Pager

**Product:** Arc (rebrand of NovaGate) · **Owner:** Product · **Date:** 2026-06-03 · **Status:** Pre-launch

---

## What it is
Arc lets anyone invest in **themed crypto baskets** — "Made in America," "AI Infrastructure," "DeFi Blue Chips" — in one tap, then share a card of what they bought. An AI co-pilot turns a plain-English theme into a weighted basket, buys every leg with a single confirmation (fiat → on-chain, cross-chain when needed), and watches for drift to rebalance.

## Why now
- Retail wants crypto exposure without picking single tokens — baskets are the index-fund analog.
- Nova's rails (fiat onramp, swap, bridge, xStocks, prediction markets) already exist; Arc is the consumer layer on top.
- Agentic UX ("describe a theme, get a basket") is newly viable and differentiates from Robinhood/Cash App style single-asset buying.

## Target user
Hybrid between **mainstream retail** (Robinhood/Acorns/Cash App mental model) and **crypto-native**. Design leans mainstream-retail. Beachhead: **250K existing Nova/NovaGate users** reachable by email on day one — no cold acquisition needed to start.

## The moat: social flywheel
Invest → shareable card (basket art + return stats + "I invested in X via Arc") → share drives discovery → new user invests → shares again. No accounts or followers required; every card links back to a forkable basket.

## Positioning
> **"Crypto baskets, built by AI, bought in one tap."**
Not a DEX, not a single-token app — a curated, narrative-driven, auto-managed portfolio you can fund with fiat and share in a tap.

## What ships at launch (v1, Days 0–14)
- ✅ Curated catalog (Made in America, AI Infrastructure) — forkable
- ✅ Per-leg valuation, drift, hourly performance snapshots
- ⏳ One-tap `buy_basket` (single-chain, single confirmation)
- Manual "rebalance now"; cross-chain, auto-rebalance, NLP-assembly follow in v1.1–v1.2

## GTM motion (first 60 days)
| Phase | Days | Move |
|---|---|---|
| **Foundation** | 0–14 | Visual rebrand live; email #1 to a 5% holdout → full 237.5K send gated on signal; curated baskets visible |
| **Integration** | 15–28 | Agent Co-Pilot MVP, cross-chain buy, drift rebalance to ≤50 alpha users |
| **Launch** | 29–42 | Email #2 ("Your AI just built you a basket"); public X launch w/ demo videos; press + CT influencer push |
| **Expand** | 43–60 | Perf-recap email #3; small paid test ($25–50K, X + Reddit); curated v2 themes |

**Channels:** owned email (primary, 250K), X/social (content calendar in `x-social-plan.md`), influencer/press, paid test only after organic signal.

## Success metrics
- **Day 30:** ≥5% open & ≥0.5% reactivation on email #1; curated baskets live; cross-chain swap path in product
- **Day 60:** DAU ≥8K (3.2% of cohort); ≥40% of basket-funders still holding ≥1 leg; email #2 ≥1.5% trade conversion; NLP basket beta NPS ≥+20

## Top risks → mitigations
- **KYC re-friction kills the funnel** → first email is no-CTA content; KYC prompt only at buy-time + white-glove support
- **"+139%" backtest claims draw regulators** → reframe as "since-curation," label backtests clearly, Compliance sign-off
- **xStock liquidity caves under reactivation burst** → per-leg min-buy floor; roll out 25K/day, not all 250K at once
- **Bridge/buy fails mid-flight** → resumable intent ledger + auto-refund path

## Open calls to lock by Day 7
Asset universe (tokens + xStocks + Polymarket; perps after D43) · rebalance default = notify · $20 min floor · backtest data source · Nova-managed custody only in v1.
