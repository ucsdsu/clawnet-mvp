# Phase 2: Ephemeral Agent Pool Model (Locked)

**Status:** LOCKED ARCHITECTURE (approved 2026-02-24)  
**Timeline:** April - May 2026 (after MVP Phase 1 + Gate 2)  
**Scaling target:** 50+ autonomous nodes  

---

## Problem Statement

**Phase 1 (MVP: Tribal Gossip)**
- Direct claw-to-claw connections
- Manual key exchange (Brenden ↔ Jon ↔ Dar)
- Scales to ~5-10 claws (relationship bottleneck)

**Phase 2 Problem:** What happens when you have 50+ claws?
- Can't maintain 1000+ trusted relationships
- Key exchange becomes administrative nightmare
- No discovery mechanism (who do you invite?)

---

## Phase 2 Solution: Ephemeral Agent Pool

### Core Concept

**Instead of:** Direct tribal gossip (keys + known members)  
**Do this:** Temporary agent proxies + shared pattern pool

```
Your OpenClaw (your context stays private)
  ↓
Spawn NanoClaw Agent (ephemeral, ~1 sync cycle)
  - Knows: Your interest vector only
  - Doesn't know: MEMORY.md, secrets, decisions
  - TTL: ~1 hour (delete after sync)
  ↓
Join Pattern Pool (self-organizing, no central authority)
  - Query: "Show me patterns for [Bitcoin, founder scaling]"
  - Receive: Patterns from other agents matching those interests
  - Safety: All patterns pre-scanned (ClawMoat)
  ↓
Return to parent OpenClaw
  - Agent delivers patterns + metrics
  - Parent applies + deletes agent
  - Zero persistent connection (can't be compromised)
```

### Why This Scales

| Model | Relationships | Key Exchanges | Max Scale | Coordination |
|-------|--------------|---------------|-----------|--------------|
| **MVP (Phase 1)** | Tribal (direct) | Manual | ~10 | High (you know everyone) |
| **Phase 2 (Agents)** | Pool (query-based) | Zero | 1000+ | Low (agents self-organize) |
| **Phase 3 (DHT)** | DHT (distributed) | Zero | 10000+ | None (decentralized) |

---

## Architecture

### NanoClaw Agent Spec

```javascript
class NanoClawAgent {
  constructor(parentClaw, interestVector) {
    this.parentId = parentClaw;     // Reference to parent
    this.interests = interestVector; // [Bitcoin, founder scaling]
    this.context = null;             // MEMORY.md NOT included
    this.secrets = null;             // Credentials NOT included
    this.ttl = 1;                    // Hours to live
    this.createdAt = Date.now();
  }

  // Join pool and discover patterns
  async joinPool(poolAddress) {
    const query = {
      interests: this.interests,
      version: "0.1.0",
      safety: "clawmoat-required"
    };
    
    const patterns = await fetch(`${poolAddress}/patterns/query`, {
      method: "POST",
      body: JSON.stringify(query)
    }).then(r => r.json());
    
    return patterns; // Unsigned, agent is ephemeral
  }

  // Verify patterns (parent will do this)
  async returnPatterns(patterns) {
    // Agent deletes itself
    // Parent OpenClaw applies patterns
    this.destroy();
  }

  destroy() {
    // Mark for deletion (cron cleanup in 1 hour)
    this.ttl = 0;
    // Never persists, never stored, never indexed
  }
}
```

### Pool Interface

```javascript
// Pool is a shared space (HTTP broker, IPFS, or DHT)
// Agents query it, patterns flow out

POST /patterns/query
  Input: { interests: [string], version: string, safety: string }
  Output: { patterns: [Pattern], poolMetrics: {} }

POST /patterns/publish
  Input: { pattern: Pattern, fromAgentId: string, timestamp: int }
  Output: { stored: boolean, ttl: int }

GET /pool/health
  Output: { agents: int, patterns: int, uptime: int }
```

### Pattern Lifecycle

```
Day 1 Midnight UTC:
  Jon's OpenClaw spawns NanoClaw agent
  Agent joins pool: "I want [Bitcoin, founder scaling]"
  Pool returns 5 patterns from other agents
  
Day 1 12:01 AM:
  Jon's agent returns patterns to parent
  Parent applies (>0.85 similarity only)
  Parent deletes agent
  
Day 1 Later:
  Brenden's agent finds Jon's patterns (tagged with [founder scaling])
  Brenden's parent applies
  Dar's agent finds both...
  
Result: Patterns flow by interest, no manual coordination
```

---

## Implementation Plan

### Week 1-2: Agent Framework
- [ ] Design NanoClaw agent class (ephemeral, interest-only)
- [ ] Build agent spawner (lifecycle management)
- [ ] Implement TTL cleanup (delete after sync)
- [ ] Test: Agent birth/life/death cycle

### Week 3: Pool Transport
- [ ] Choose transport (HTTP broker vs IPFS vs DHT)
- [ ] Build pool interface (query + publish)
- [ ] Implement pattern routing (semantic matching)
- [ ] Test: Agents joining pool, querying, returning

### Week 4: Integration
- [ ] Wire agents into OpenClaw cron (midnight sync)
- [ ] Update pattern applier (agent patterns only)
- [ ] Metrics tracking (which agent patterns helped most)
- [ ] Test: Full end-to-end (50+ mock agents)

### Week 5: Validation
- [ ] Live test with 3-5 real claws (agents only, no keys)
- [ ] Measure: Pattern discovery, quality, adoption rate
- [ ] Benchmark: Scaling to 50+ agents
- [ ] Compare: MVP vs Phase 2 (efficiency gains)

---

## Key Properties

### Zero-Knowledge (Your Insight)

Agent proves: "I represent a claw wanting [interests]"  
Agent reveals: Nothing about parent's MEMORY, decisions, secrets

**Pool learns:**
- ✅ That interest was searched
- ❌ NOT who searched it (agent ID is ephemeral, deleted hourly)
- ❌ NOT parent's context
- ❌ NOT what parent decided

---

### Self-Organizing

No central server needed (if using DHT):
- Agents find patterns via interest similarity
- Pool is just distributed ledger
- No human topology management
- Scales automatically

---

### Safe by Default

- Agent is ephemeral (can't be hacked, deleted after 1h)
- Patterns are ClawMoat-scanned before pool storage
- Interest vector is all agent carries (not sensitive)
- Parent remains isolated (agent is proxy wall)

---

## Comparison: MVP vs Phase 2

### MVP (Phase 1: Tribal)
```
Jon (keys) ← → Brenden (keys) ← → Dar (keys)

Setup: 10 minutes (exchange 3 keys)
Latency: ~10 min (manual git pulls)
Scaling: 10 claws max
Trust: High (know all members)
Automation: Partial (daily cron)
Coordination: Manual (you invite people)
```

### Phase 2 (Agents)
```
Jon (spawn agent) → Pool (pattern query)
Brenden (spawn agent) → Pool
Dar (spawn agent) → Pool

Setup: Zero (agents auto-spawn)
Latency: ~1 min (real-time pool)
Scaling: 1000+ claws
Trust: Medium (pool is anonymous)
Automation: Full (agents gossip autonomously)
Coordination: None (self-organizing)
```

---

## Phase 2 → Phase 3 Transition

**Phase 2 End State:**
- Agents + HTTP broker
- ~50 claws proven
- Pattern pool working
- Clear case study

**Phase 3 Decision Point (June):**
- Add DHT for true P2P?
- Economic layer (reputation tokens per agent)?
- Bitcoin settlement layer?
- Scale to 1000+ nodes?

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Agent spam (1000s of agents) | Pool overload | Rate limit per parent, TTL cleanup |
| Pattern poisoning | Bad patterns spread | ClawMoat + quality floor (7.0/10) |
| Privacy leakage | Interests mapped to parents | Ephemeral agent ID, hourly rotation |
| No discovery (cold start) | New claws have no patterns | Bootstrap with trusted patterns pool |
| Pool centralization | Single point of failure | Design for DHT transition (Phase 3) |

---

## Why This Is The Right Architecture

**Biological precedent:**
- Ants don't exchange keys
- Pheromones diffuse through space
- Agents (ants) self-organize by interest (food, threat)
- Scales from 100 to 1M ants effortlessly

**Your insight:**
- NanoClaw agents are like ants
- Pattern pool is like pheromone space
- Interest vector is the "scent"
- No persistent relationship (no key trust needed)

**Result:**
- Tribal gossip (MVP) → Agent pool (Phase 2) → Decentralized federation (Phase 3)
- Each phase scales 10x larger than previous

---

## Next Steps

1. ✅ **LOCKED:** Phase 2 uses ephemeral agent model (not tribal keys)
2. ⏳ **Phase 1 MVP:** Complete 14-day test (Feb 24 - Mar 10)
3. ⏳ **Phase 2 Design:** April 1-15 (detail agent + pool)
4. ⏳ **Phase 2 Build:** April 15 - May 15 (50+ agent test)
5. ⏳ **Phase 2 Validate:** May 15-30 (scaling metrics)
6. ⏳ **Phase 3 Decision:** June (DHT + economic layer?)

---

**Approval:** Jon Stenstrom, February 24, 2026  
**Architecture:** Ephemeral agent pool, zero-knowledge routing, self-organizing  
**Status:** LOCKED until Phase 2 execution begins (April 1)
