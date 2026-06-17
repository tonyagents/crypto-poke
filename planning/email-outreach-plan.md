# Arc — email outreach plan (250K cohort)

**Goal:** reactivate the 250K idle Moongate emails into Arc users. Day-one distribution channel per deck p2.

---

## 1. The list — where it actually lives

`data/users.json` in this repo has 19 test phone-keyed records, **not** the 250K cohort. Real list is in one of:

1. **Moongate prod DB** — original signup table.
2. **MoonPay CRM** (Customer.io / Iterable / Braze, whatever the company standard is — confirm).
3. An exported CSV from migration prep.

**Action D0:**
- Eric to confirm canonical source + access path with MoonPay's growth/CRM owner.
- Pull schema: minimum needed = `email, signup_date, last_active, kyc_status, country, wallet_funded_ever (bool), product_actions[]`.
- Identify suppression: bounced, complained, GDPR-deleted, jurisdiction-blocked (sanctioned countries, plus any state-level US restrictions on the comms).

**Hard requirements before send:**
- CAN-SPAM compliant footer with physical address.
- GDPR re-consent for EU users if Moongate's original opt-in didn't cover Arc (likely needs review).
- Suppression list scrubbed against MoonPay's master unsubscribe list (don't email someone who has opted out of MoonPay marketing — even from a different product).
- SPF/DKIM/DMARC on `arc.*` sending domain — needs to be set up at least 14 days before first send for warm-up.

---

## 2. Tool choice

Three viable options, ranked:

| Tool | Why | Why not |
|---|---|---|
| **Customer.io** *(recommended)* | Behavior-driven sequencing; works well for "did open #1 + did fund wallet" branching that's central to this plan; webhook integration with Arc backend for trigger-on-action emails | Slower setup if MoonPay doesn't already use it |
| **Iterable** | If MoonPay already runs on it, free win — reuse warmed domain, existing suppression list | Heavyweight if standing up fresh |
| **Loops** | Fast to set up, modern editor, $79/mo for 250K is plausible | Less behavior-tree power; may need a second tool by Day 60 |
| Resend | Great DX but more of a transactional + lightweight marketing tool | Lacks the segmentation/automation depth for a reactivation campaign |

**Recommendation:** *use whatever ESP MoonPay already runs on* (likely Iterable or Customer.io). Two reasons:

1. **Domain warmth.** Arc emails should send from `*.moonpay.com` or a sibling pre-warmed sending domain. Cold-warming `arc.com` takes 2–4 weeks and crushes inbox placement on a 250K blast.
2. **Suppression hygiene.** Reusing MoonPay's suppression list is non-negotiable — sending Arc to a previously-unsubscribed MoonPay customer is a compliance incident.

**Action D0–D3:** lock the tool with Growth ops. Stand up a separate Arc subdomain (`mail.arc.moonpay.com` or similar) under the existing warm IPs to avoid contaminating the main brand's sender reputation.

---

## 3. Segmentation

Three primary segments on the 250K, by *behavior in Moongate*, not by demographics:

| Segment | Definition | Approx. size (assumed) | Hypothesis | First-send subject angle |
|---|---|---|---|---|
| **A — Funded** | Wallet funded ≥ 1x | ~15–25% | "Showed intent, didn't stick" — pull back with a concrete product upgrade | "Your Moongate wallet just got smarter" |
| **B — KYC-complete, never funded** | Onboarded but didn't deposit | ~30–40% | KYC friction wasn't the blocker; value-prop or trust was | "We rebuilt this. Try it." |
| **C — Signed up, no KYC** | Created an account, dropped | ~40–55% | Friction kills — needs a frictionless entry point | "Pick a theme. Tap once." |

Segments are not exposed in copy. They drive subject line, CTA, and re-prompt cadence.

**Holdout test (D10–D14):** Pull a random 5% holdout (~12.5K) across all three segments for first send. Measure open + click + reply before pushing the remaining ~237.5K.

---

## 4. Three-email sequence (D14 → D43)

### Email #1 — Reintroduction (D14)

- **Goal:** open + click. Not asking for a trade.
- **From:** Real human name (e.g. "Eric at Arc" or whoever the brand voice is) — not a no-reply.
- **Subject A:** "We rebuilt Moongate. It's called Arc."
- **Subject B (holdout):** "Your Moongate account is now Arc — here's what changed"
- **Pre-header:** "Curated narrative baskets, agent-managed, MoonPay checkout."
- **Body skeleton:**
  > [Name] —
  >
  > Last year you signed up for Moongate. We've been heads-down. Today we're shipping the version we wanted to build originally: **Arc**.
  >
  > Tap a theme. The agent builds the basket. MoonPay checks you out. Done.
  >
  > Three things changed:
  > 1. Curated narrative baskets (Made in America, AI Infrastructure, more coming).
  > 2. An agent that monitors 24/7 and rebalances when the world moves.
  > 3. Native MoonPay checkout — Apple Pay, Google Pay, card. No crypto wrangling.
  >
  > Your account moved over. **[See your Arc dashboard →]**
  >
  > — [Name]
  >
  > *PS: You can ignore everything from Moongate. The handle, the look, the link — all replaced.*
- **CTA:** Magic-link login to Arc (no password recovery friction).
- **Suppression:** anyone who opens *and* clicks gets removed from email #2's reactivation thread and moves to onboarding flow.

### Email #2 — Show, don't tell (D29)

- **Goal:** trade conversion.
- **Segmented variants:**
  - **A (funded users):** "We rebalanced your old basket — here's what happened" (uses real performance data; falls back to template performance if user had no basket).
  - **B (KYC-complete):** "Watch the agent build a basket in 30 seconds" — embed a looping GIF / video.
  - **C (no KYC):** "Sign in with Apple — tap a theme — done" — emphasize the 3-tap path.
- **Subject A test:** "Your basket is +6.2% this week" vs "An AI just rebalanced your portfolio".
- **CTA:** Deep-link into the chat with a pre-filled "Show me curated baskets" prompt.

### Email #3 — Performance recap / loss aversion (D43)

- **Goal:** convert openers who haven't traded yet; surface wins to the funded cohort.
- **Funded cohort:** "Your Made in America basket is +X% since you joined" — drives from the snapshot writer's history.
- **Non-funded cohort:** "Here's what users who started a Made in America basket on launch day are seeing" — social proof, anonymized.
- **CTA:** open Arc + funding flow.
- **Suppression:** users with ≥ 1 funded basket skip to a different track (engagement / cross-sell to NLP basket assembly).

---

## 5. Always-on trigger emails (separate track)

Behavior-driven, fired by Arc backend, not the campaign tool's calendar:

| Trigger | Email | Logic |
|---|---|---|
| Created basket but didn't fund within 48h | "Your basket is waiting" | Deep-link back to the same basket draft |
| Basket drifted > 7pp from target | "Time to rebalance?" (notify mode) | Only sends if auto-rebalance is *off* |
| Curated template the user forked was updated | "We updated [template name]. Want to mirror the changes?" | Opt-in to auto-mirror; otherwise read-only diff view |
| Significant macro event detected for held basket | "Earnings movers hit your AI Infrastructure basket" | Throttled to ≤ 1/week per user |

These should live in the same ESP as the campaign emails for unified suppression + frequency capping (≤ 4 emails/week per user, ≤ 1/day).

---

## 6. Measurement

Single metric: **trade conversion** (funded ≥ 1 basket) on the 250K cohort by Day 60.

Funnel:
- Sent → Delivered → Opened → Clicked → App-opened → Funded.

Per-stage benchmarks (re-engagement of dormant base, somewhat aggressive):
- Delivered: ≥ 97% of sent (bounce rate < 3%; if higher, list hygiene was wrong).
- Open: ≥ 12% on email #1 (cold dormant base; if the list is warmer, target ≥ 18%).
- Click: ≥ 1.5% of sent.
- App-open: ≥ 70% of clicks.
- Funded: ≥ 0.5% of sent by D60 = ~1,250 reactivated buyers.

**If email #1 misses open or click by > 50%:** pause the campaign, do not push to the full list. Diagnose deliverability (sender rep, domain warmth) before iterating on copy.

---

## 7. Comms strategy alignment

Email is one prong; needs to land *simultaneously* with:
- Site live at `arc.com` (or chosen domain) by D14.
- X handle launched (`x-social-plan.md`).
- In-app brand swap complete (no Moongate references anywhere a clicked-through user could land).
- Customer support trained on Arc-specific Qs (recovery flows, "what happened to my Moongate account").

---

## 8. What blocks this plan

| Block | Owner | By when |
|---|---|---|
| ESP confirmed + Arc sending domain warmed | Growth ops | D7 |
| 250K list pulled, schema validated, suppression scrubbed | Growth + Eng | D10 |
| Legal review of subject lines + body copy (esp. for EU re-consent) | Legal | D10 |
| `arc.com` (or domain) live with login flow that recognizes Moongate accounts | Eng | D14 |
| Snapshot writer has ≥ 7 days of basket history (for email #3 perf data) | Eng | D36 |
| Customer support runbook | CX | D12 |

---

## 9. Copy drafts (rough — needs brand + legal pass)

### Email #1 — short version

> Subject: We rebuilt Moongate. It's called Arc.
> Pre-header: Curated baskets. Agent-managed. MoonPay checkout.
>
> Hey [first_name],
>
> A year ago you signed up for Moongate. We took the feedback, the data, and a hard look — and rebuilt it.
>
> Today it's Arc. The pitch in one sentence: tap a theme, the agent builds the basket, MoonPay checks you out.
>
> What's different:
> - **Curated baskets**: Made in America. AI Infrastructure. More dropping monthly.
> - **An agent**: monitors news, filings, on-chain — and tells you (or just does it) when your basket should move.
> - **MoonPay checkout**: Apple Pay, card. No crypto headache.
>
> Your account moved over automatically.
>
> [→ Open Arc]
>
> Eric
> PS: This used to be "Moongate." If you signed up under that name, same account — just a better product.

### Email #2 — segment B (KYC done, never funded)

> Subject: Tap a theme. Done.
> Pre-header: A 30-second basket, courtesy of Arc.
>
> Hey [first_name],
>
> We've watched users build baskets in under 30 seconds.
>
> Pick "Made in America." The agent assembles 8 xStocks weighted to today's macro. MoonPay does the checkout — Apple Pay, card, whatever.
>
> [→ See the live "Made in America" basket]
>
> Two taps from here, you're in.
>
> Eric

(Subject + body copy to be A/B tested. Final brand voice TBD.)
