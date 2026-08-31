# Arc on X — Social one-pager

**Handle:** [@OneNovaGate](https://x.com/OneNovaGate) → rebrand to `@Arc_*` at launch (handle locked by D7) · **Day 0** = the day we flip the rebrand publicly (visual + comms live, email #1 queued).
**Brand voice:** first-person founder, crisp, data-led, no hype. Reads like a sharp trader, not a marketing department. Reviewed D60.
**Content lead:** [REDACTED] drives D0–D14. **Successor TBD by D10 — this is a blocker, not an open question.**
**Goal:** Build narrative authority around agent-managed baskets + funnel the 250K reactivation cohort into Arc.
**Why cross-functional:** Every post is a product surface. What eng ships, the agent observes, and the basket does *is* the content. Social cannot run alone.

---

## The four pillars

| | Pillar | What it is | % | Sample post (mock) |
|---|---|---|---|---|
| **A** | **Replies & engagement** | Reply/QT high-signal accounts in fintech, crypto, agent/AI. Add data — never lead with the plug | 30% | *Reply to a macro thread on Fed cuts:* "Our Made in America basket repositioned for this last Friday — here's the 7d delta: [chart]" |
| **B** | **Market reporting + AI analysis** | Daily agent-drafted posts on macro moves, earnings, on-chain. Human-reviewed in v1 (15-min SLA, brand approves) | 30% | "NVDA +6% on the print. AI Infrastructure basket auto-rebalanced 3h before — here's the on-chain signal the agent saw. [thread]" |
| **C** | **Weekly "here's what we did"** *(Fri 9am ET)* | What shipped, what the baskets returned, what users did. One metric, one chart, one user behavior | 20% | "Week 3 in Arc: cross-chain shipped, Made in America +2.4%, 412 baskets forked. Most-forked theme: defense." |
| **D** | **Theme of the Week** *(Mon 10am ET)* | Launch a new curated basket with the agent's reasoning. Direct CTA: fork in one tap | 20% | "This week: Energy Independence. 8 xStocks weighted to domestic O&G + nuclear. The agent's reasoning: [thread]. Fork →" |

**Why Theme of the Week beats the alternatives (Behind the Build, Contrarian):** it pairs with Friday's recap to create a weekly news cycle (Mon drop → Fri proof), and it forces a new curated basket every Monday — a feature ship cadence built into the social rhythm.

---

## What each team owes social

| Team | Owes | By when |
|---|---|---|
| **Product** | Friday recap input — 1 shipped feature + 1 metric + 1 user behavior | Every Wed EOD |
| **Product** | Surface agent-detected events worth posting | Continuous → `#social-signals` Slack |
| **Engineering** | (1) Basket-snapshot screenshot endpoint (2) Agent → draft-tweet review queue (3) Brand-mention webhook for sentiment spikes | (1) D21 · (2) D35 · (3) D14 |
| **Brand / Design** | Post templates: basket card, rebalance card, weekly recap card | D10 |
| **Legal / Compliance** | Pre-approved disclaimer language + template-level approval for Pillars B & C | D10 |
| **Founders** | ≥5 personal-account replies/day; 1 Pillar D thread/month from a founder | Continuous |

---

## Listening (feeds Pillar B + brand monitoring)

**Source:** Messari (`messari-alpha-scout`, `narrative-to-market` — already in repo). Not raw X firehose — saves ~$5K/mo on X Pro tier.

**Standing queries → `#social-signals` daily:**
- Earnings/macro catalysts hitting basket holdings (NVDA, TSLA, AAPL, MSFT, GOOGL, META, AMZN, COIN)
- Top 10 trending crypto narratives → Pillar D candidates
- Mentions of `@OneNovaGate` / Arc / NovaGate → brand monitoring (negative spike escalates to [REDACTED] + Comms in <30 min)
- Mentions of Cesto / JoinAutoPilot → reactive content opportunities

---

## KPIs — baseline-first

**Week 1 (D0–D7):** Capture baseline on `@OneNovaGate` — followers, avg engagement rate, mention frequency, app click-through. No targets this week.

**Targets are deltas from Week-1 baseline:**

| Metric | D30 | D60 |
|---|---|---|
| Followers | +25% | +75% |
| Avg engagement rate | 2x baseline | 3x baseline |
| Brand mentions / week | +50 | +200 |
| Click-through to Arc app / week | +500 | +2,000 |
| Funded baskets attributed to X / week | — | +150 |

---

## Crisis comms (1-line escalation)

Account compromise / agent misposts / negative sentiment spike / regulatory flag → **paused immediately by Brand → escalation to [REDACTED] + Comms + Legal within 30 min**. Auto-posting stays disabled in v1 specifically so the surface area is bounded.

---

## Cost (monthly)

X Basic API $200 · Premium Gold for Orgs $1,000 · Messari (pay-per-call) $50–200 → **~$1,250–1,400/mo**.
X Pro ($5K) only if Agent Co-Pilot needs raw-tweet recall — decide D60.

---

## Open decisions (lock by D7)

1. **Handle migration** — rebrand in place (recommended, preserves followers) vs. new `@Arc_app` / `@hi_arc` / `@get_arc`.
2. **Content lead succession** — who replaces [REDACTED] at D14? (Hire / contractor / internal reassignment.)
3. **Spaces** — launch Space at D32–D35 alongside email #2?
4. **Auto-post threshold** — recommended: never in v1; revisit D60.

---

## Launch sequence

- **D0–D2** — handle decision · verification application · bio refresh (still `@OneNovaGate`, hints at Arc)
- **D3–D13** — soft ramp, 1 post/day, no announcement (algorithm cold-start)
- **D14** — pinned launch thread "NovaGate is now Arc" + handle rename if approved + email #1 fires same day
- **D14–D28** — high-frequency replies in Solana / prediction-market / fintech / agent circles
- **D21** — first Pillar D thread (likely AI Infrastructure)
- **D32–D35** — public push with email #2 + influencer outreach + optional Spaces
- **D42** — "30 days of Arc" recap thread
