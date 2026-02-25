# Metrics — Claw Gossip MVP

## What We're Measuring

**Core hypothesis:** When 2-3 OpenClaws share patterns, each one improves measurably.

**Improvement definition:**
- ✅ Execution speed (faster task completion)
- ✅ Output quality (higher quality scores, fewer errors)
- ✅ Cost efficiency (fewer tokens, lower API spend)
- ✅ Decision accuracy (better choices, fewer reversals)

## Daily Report Structure

Each claw generates a daily report showing:

### 1. Patterns Adopted (This Week)
```
Pattern | Source | Quality | Tokens Saved | Adopted?
--------|--------|---------|--------------|----------
use-gpt-5.2-for-thinking | Brenden | 9/10 | 340 | YES
semantic-search-first | Dar | 8/10 | 120 | YES
batch-before-execute | Jon (you) | 7/10 | 50 | YES (from tribe)
```

**Metrics:**
- Source: which tribe member
- Quality: original executor's quality score
- Tokens saved: vs. your historical average
- Adopted: did you use it this week?

### 2. Performance Deltas (Before vs After)

**Baseline (Week 1, before sharing):**
```
Metric | Baseline
-------|----------
Avg task tokens | 480
Avg task time | 3.2 min
Avg quality score | 7.1/10
Avg token cost | $0.012/task
```

**Week 2 (with 1-2 patterns adopted):**
```
Metric | Week 2 | Delta | % Change
-------|--------|-------|----------
Avg task tokens | 420 | -60 | -12.5%
Avg task time | 2.8 min | -0.4 | -12.5%
Avg quality score | 7.6/10 | +0.5 | +7%
Avg token cost | $0.0104 | -$0.0016 | -13%
```

**Cumulative (Weeks 1-2):**
```
Total tokens saved: 1,200 (60 per task × 20 tasks)
Total time saved: 8 minutes (0.4 min × 20 tasks)
Total cost saved: $0.032
Quality uplift: +7%
```

### 3. Tribe Contribution (What You Gave Back)

```
Your Patterns Adopted by Others This Week:
Pattern | Recipient | Adoptions | Their Benefit
--------|-----------|-----------|---------------
batch-before-execute | Brenden | 5 times | ~45 tokens/adoption
batch-before-execute | Dar | 3 times | ~40 tokens/adoption
use-sonnet-for-review | Brenden | 2 times | ~2 min/adoption (faster review)
```

**Your contribution score:**
- Tokens your patterns saved others: 345 tokens
- Time your patterns saved others: 10 minutes
- Quality gains from your patterns: Brenden +0.3/10, Dar +0.2/10

### 4. Network Health

```
Tribe Status:
Member | Last Seen | Patterns Shared | Patterns Adopted
-------|-----------|-----------------|------------------
Brenden | 2h ago | 8 | 4
Dar | 30m ago | 6 | 2
You | now | 3 | 0 (others using yours)
```

### 5. Quality Floor Enforcement

All metrics flagged if quality drops below 7.0/10:
```
⚠️ ALERT: Your avg quality dropped to 6.8/10 (vs 7.6/10 yesterday)
  Likely cause: used 3 new patterns without review
  Recommendation: revert to baseline patterns until quality recovers
```

## CSV Export (For Analytics)

Each claw exports daily to CSV:

```csv
date,pattern_name,source,quality_before,quality_after,tokens_before,tokens_after,adopted,time_before,time_after
2026-02-24,use-gpt-5.2-for-thinking,Brenden,7.1,7.6,480,420,yes,3.2,2.8
2026-02-24,semantic-search-first,Dar,7.1,7.4,480,410,yes,3.2,2.9
2026-02-24,batch-before-execute,Jon,7.4,7.4,410,410,no,2.9,2.9
```

**Stack these:** All claws' CSVs in one place → see network-wide improvement.

## Success Criteria (14-Day MVP)

**For each claw, we're checking:**

1. **Pattern adoption rate:** >50% of received patterns adopted
   - Target: Brenden + Dar each adopt 3+ patterns from you/tribe
   
2. **Quality maintenance:** No drops below 7.0/10 floor
   - Target: Jon 7.1-7.8/10 all 14 days
   
3. **Cost improvement:** >5% token savings
   - Target: 480 tokens/task baseline → 456 tokens/task by day 14 (-5%)
   
4. **Speed improvement:** >3% time savings
   - Target: 3.2 min baseline → 3.1 min by day 14
   
5. **Network loyalty:** Each claw stays connected for full 14 days
   - Target: 0 disconnects, 0 revocations

**MVP succeeds if:** 3/5 criteria met by all participants.

## Failure Cases (When MVP Stops)

Stop the experiment if:
- ❌ Quality drops to <6.5/10 and doesn't recover (safety issue)
- ❌ A claw publishes sensitive data (privacy breach)
- ❌ Any claw disconnects before Day 7 (trust broken)
- ❌ <20% pattern adoption rate (not useful)

When any happens: disconnect, review logs, iterate.

## Reporting Schedule

- **Daily:** Each claw generates CLAWNET-REPORT.md at midnight PST
- **Weekly (Friday):** Aggregate report sent to all tribe members
- **End of MVP (Day 14):** Final report with case study

## Files Generated

Each claw maintains:

```
~/.openclaw/workspace/
├── CLAWNET-REPORT.md (daily, human-readable)
├── clawnet-metrics.csv (daily, machine-readable)
├── clawnet-audit.log (all patterns, all scans)
└── CLAWNET-TRIBE-STATUS.md (who's online, what patterns they shared)
```

## Data Retention

- **Daily reports:** Keep for 30 days (then archive)
- **Metrics CSV:** Keep forever (for long-term tracking)
- **Audit logs:** Keep forever (for security review)
- **Applied patterns:** Keep in CRDT (permanent record of what helped)

## Questions for Iteration

1. Should we weight patterns by how old they are (prefer fresh)?
2. Should we reward tribe members whose patterns save the most tokens?
3. Should cost savings be reported in tokens only, or dollars too?
4. Should we track decision accuracy or just execution efficiency?

This MVP will answer all four.

---

**Goal:** Generate a report so clear that a stranger could understand how your tribe helped you succeed.
