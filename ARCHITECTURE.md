# Claw Gossip — Architecture

## Overview

Claw Gossip is a decentralized federation protocol for OpenClaw instances to share patterns and improve autonomously.

**Core principle:** Each claw is sovereign. No central authority. Patterns flow based on semantic interest matching.

## Components

### 1. Interest Graph Extractor

**Input:** SOUL.md, MEMORY.md, projects/, decisions/, ideas/  
**Output:** Semantic interest vector (embeddings of what the user cares about)

```
SOUL.md → extract identity themes
MEMORY.md → extract active obsessions
projects/ → what are they building?
decisions/ → what decisions matter?
ideas/ → what's being explored?

Combine → semantic vector (dimensions: Bitcoin, family, automation, content, finance, etc.)
```

**Privacy:** Only the *topic* leaves your machine. Not the content.

### 2. Gossip Protocol

**Transport:** mTLS peer-to-peer (no central server)  
**Algorithm:** SWIM-style convergence with interest-based subscriptions  
**Frequency:** Daily sync, on-demand push

```
[Your Claw] 
  ├─ Publish: interest_graph + distilled_patterns
  └─ Subscribe: patterns matching >0.85 embedding similarity

[Tribe Member Claw]
  ├─ Receives interest_graph from you
  ├─ Compares: do they match our interests?
  ├─ If yes: sends back distilled_patterns
  └─ Includes: ClawMoat safety scan result
```

**Convergence:** All claws eventually agree on shared patterns (CRDT merge).

### 3. Pattern Distillation

**Input:** Raw MEMORY.md, decision records, execution logs  
**Output:** Distilled pattern (approach + metrics, no PII)

```
Raw: "Used GPT 5.2 for planning because thinking quality matters. Cost $0.042/task. Took 2.3min. 9/10 output quality."

Distilled: {
  "approach": "use-gpt-5.2-for-thinking",
  "metrics": {
    "cost_per_task": 0.042,
    "time_minutes": 2.3,
    "quality_score": 9
  },
  "contexts": ["financial-decision", "architecture-planning"],
  "timestamp": "2026-02-24"
}
```

**Safety:** No specific data, no credentials, no customer names.

### 4. ClawMoat Scanner

**Runs on:** Every inbound pattern, every outbound pattern

**Scans for:**
- Credentials (api_key=, password:, token:, secret:)
- PII (emails, phone numbers, SSNs, addresses)
- Domain names (*.com → [REDACTED-DOMAIN])
- Specific values (exact numbers → ranges/percentages)
- Encoding attacks (base64, hex, ROT13)

**Actions:**
- ✅ Safe: pattern accepted, auto-applied if >0.85 match
- ⚠️ Suspicious: quarantine, human review, alert sent
- ❌ Dangerous: blocked, logged, not transmitted

### 5. CRDT Storage

**Library:** Automerge (append-only, conflict-free merging)

**What's stored:**
- Interest graph history (track evolution)
- Applied patterns (which came from which tribe member)
- Metrics logs (token cost, quality, adoption)
- Tribe roster (public keys, last seen)

**Why CRDT:** No central server. If your tribe splits, the patterns merge correctly when you reconnect.

### 6. Daily Report Generator

**Input:** CRDT logs + metrics  
**Output:** Markdown report showing:
- Patterns adopted from each tribe member
- Tokens saved (vs. your historical average)
- Quality improvements (speed, accuracy, cost)
- Your contribution (which of your patterns helped others)

## Message Flow

```
Day 1:
  [Your Claw] → extract interest graph → publish to tribe
  [Tribe] → receive → scan → reply with patterns
  [Your Claw] → receive patterns → ClawMoat scan → CRDT store

Day 2 onward:
  [Daily sync] → check for new patterns → auto-apply if match
  [Daily report] → generate metrics → show improvement
```

## Security Assumptions

1. **mTLS key exchange is secure** — you get Brenden's public key, he gets yours, offline key exchange
2. **ClawMoat scans are sufficient** — regex + embedding similarity catches most leaks
3. **Your tribe members are trusted** — this isn't for adversarial networks
4. **Local storage is secure** — OpenClaw's file permissions protect MEMORY.md

## Scalability

**MVP (2-3 claws):** File-based gossip, mTLS keys  
**Phase 2 (10-100 claws):** Add pub/sub broker (Redis, Nats) for fanout  
**Phase 3 (1000+ claws):** Add DHT (Kademlia) for peer discovery

Current MVP stays peer-to-peer (no infrastructure needed).

## Known Limitations

1. **No compression:** Full patterns transmitted (solve with delta encoding)
2. **Synchronous sync:** If a claw is offline, it misses patterns (solve with async queue)
3. **No rollback:** Once a pattern is applied, it stays (solve with version history)
4. **Manual key exchange:** You share keys offline (solve with DNS-over-HTTPS key discovery)

All solvable in Phase 2 if MVP succeeds.

## Next Steps

See `docs/METRICS.md` for measurement spec.  
See `docs/PRIVACY-MODEL.md` for full security model.  
See `SKILL.md` for installation and usage.
