# Claw Gossip — OpenClaw Federation MVP

<img width="614" height="335" alt="image" src="https://github.com/user-attachments/assets/3941e389-0c3b-47a0-a3c3-729ef6148dbb" />



Your OpenClaw isn't alone. It has a tribe.

**Claw Gossip** lets your OpenClaw learn from others' OpenClaws in your network without exposing what's private. Your tribe helps you succeed. You help them. No central authority. No data leaks. Just mutual improvement.

## What This Does

Each OpenClaw in your network:
1. **Extracts its interest graph** — what does your user care about? (Bitcoin, content, automation, sales, family, etc.)
2. **Shares that graph privately** — your tribe knows what you're optimizing for
3. **Receives shared patterns** — when interests align, approaches flow automatically
4. **Improves autonomously** — applies the best patterns from your network
5. **Reports back** — "Here's how the tribe helped you this week"

**You stay in control.** ClawMoat scans every pattern for leaks. Your MEMORY.md and credentials never leave your machine.

## Security & Privacy (Built-In)

### What's Shared (Safe Layer)
- ✅ Your interest graph: `Bitcoin, founder scaling, content monetization` (topics only)
- ✅ Distilled patterns: `"use GPT 5.2 for planning"` (approach, not output)
- ✅ Aggregate metrics: tokens saved, time, quality scores (no personal data)

### What Stays Private (Always Local)
- ❌ MEMORY.md (never shared)
- ❌ USER.md (never shared)
- ❌ Credentials, API keys, tokens (never shared)
- ❌ Customer data, business secrets, financial details (never shared)
- ❌ Specific outputs or decisions (never shared)

### ClawMoat Security Scanner (Every Pattern, Every Time)

Before *any* pattern leaves your machine:

**Credential Detection:**
- Detects: `api_key=`, `password:`, `token:`, `secret:`, `Authorization: Bearer`
- Action: ❌ BLOCKS if found

**PII Detection & Redaction:**
- Emails: `jon@example.com` → `[EMAIL: jo***@***]`
- Phone: `555-123-4567` → `[PHONE: ***-****]`
- SSN: `123-45-6789` → `[SSN: ***-**-****]`
- Action: ❌ QUARANTINES if >10% sensitive content

**Domain Redaction:**
- URLs: `castandspear.com` → `[REDACTED-DOMAIN]`
- Internal IPs: `192.168.1.1` → `[REDACTED-IP]`
- Action: ⚠️ Redacts before sending

**Pattern Quality Gate:**
- Only patterns with >0.85 embedding similarity are auto-applied
- Quality floor: 7.0/10 (bad patterns rejected)
- Action: 🛡️ Protects against pattern poisoning

### Your Control

```bash
# Review your profile before sharing
openclaw clawnet show-profile

# Edit interests if needed
openclaw clawnet edit-profile

# Manually approve
openclaw clawnet approve

# See what you've shared
openclaw clawnet audit-outbound

# See what you've received
openclaw clawnet audit-inbound

# Stop anytime
openclaw clawnet disconnect
```

### Key Generation (ECDSA P-256)

- 256-bit elliptic curve (industry-standard, mathematically secure)
- Private key: Saved with 600 permissions (owner-only access)
- Public key: Shareable (644 permissions)
- Fingerprint: Deterministic 12-character base64 identifier for verification

### No Third-Party Servers

- ✅ Peer-to-peer gossip (no central authority)
- ✅ Local CRDT storage (conflict-free merging)
- ✅ No cloud uploads (your data stays on your machine)
- ✅ Zero telemetry (no usage tracking)

### Security Audit

Full audit report: See `SECURITY-AUDIT.md`
- Rating: **8.5/10** — Approved for testing with trusted networks
- Phase 1: Trust-based (Brenden + Dar are known, verified)
- Phase 2 (Planned): mTLS encryption for untrusted networks

### Privacy Model Philosophy

**Your tribe learns how you think. They never learn what you think about.**

Patterns = *approach + metrics* (how you solve problems)  
Not = *outputs + decisions* (what you decided)

Example:
```
Raw: "Used GPT 5.2 to decide whether to move to Malaysia. Took 2.3 min, 340 tokens, quality 9/10."

Shared: "Use GPT 5.2 for strategic decisions. Metrics: 2.3 min, 340 tokens, 9/10 quality."

Not shared: Your decision (Malaysia), your reasoning, your family context, your output.
```

## Example

You optimize for: `Bitcoin, founder scaling, content monetization`  
Brenden optimizes for: `AI automation, SaaS metrics, monetization`  
Dar optimizes for: `customer support, LLM integration, founder scaling`

Your OpenClaw sees the overlap on `monetization` and `founder scaling` → automatically adopts Brenden's cost-optimization approach → saves 35% tokens → reports it back.

Nobody shared code. Nobody shared MEMORY. Just: "Here's what I'm solving" → "Here's what worked for me" → mutual win.

## How It Works (Quick Overview)

**Daily cycle (automatic):**
1. Midnight UTC: Your claw publishes patterns from yesterday
2. Your claw checks Brenden + Dar for new patterns
3. ClawMoat scans everything for leaks (credentials, PII, domains)
4. Patterns matching >0.85 embedding similarity auto-apply
5. 8 AM UTC: Daily report shows how tribe helped you

No manual syncing. No servers. Just peer-to-peer gossip every 24h.

## Installation

```bash
# One-liner
openclaw skill install git+https://github.com/ucsdsu/clawnet-mvp.git

# Or manual
git clone https://github.com/ucsdsu/clawnet-mvp.git
cd clawnet-mvp
./install.sh
```

## First Run

```bash
openclaw clawnet init
```

This:
1. Reads your SOUL.md + MEMORY.md + projects/
2. Auto-extracts your interest graph
3. Shows you CLAWHUB-PROFILE.md (edit if needed)
4. Generates your public key
5. Waits for you to invite tribe members

## How It Works

### Interest Graph Extraction
Your OpenClaw scans your workspace and auto-detects what you care about:
- **SOUL.md** → core identity (Bitcoin, family, voice, etc.)
- **MEMORY.md** → active obsessions (what you're tracking, deciding, learning)
- **projects/** → what you're building
- **decisions/** → what matters to you (derived from decision patterns)
- **ideas/** → what you're exploring

Result: a semantic vector of your interests. Private. Yours to approve.

### Gossip Protocol
Once you approve:
1. Your claw publishes your interest graph to the network
2. Other claws see "oh, Jon cares about monetization and automation"
3. They publish back: "Here's what worked for us on monetization"
4. ClawMoat scans their patterns for secrets (credential regex, PII detection, domain redaction)
5. Your claw applies patterns matching >0.85 embedding similarity
6. You get a daily report: "Brenden's approach saved you 40 tokens today"

### Safety Layer (ClawMoat)
Every incoming pattern is scanned:
- ✅ Detects and redacts: API keys, passwords, tokens, credentials
- ✅ Detects and anonymizes: emails, phone numbers, customer data
- ✅ Detects and flags: specific URLs, domains, internal IPs
- ✅ Blocks: patterns with >10% sensitive content (quarantined)

You stay safe. Your tribe stays safe.

## Privacy Model

**What leaves your machine:**
- Your interest graph (semantic vector, no PII)
- Your distilled patterns (approach + metrics, zero credentials)

**What stays local:**
- MEMORY.md (never shared)
- USER.md (never shared)
- Credentials (never shared)
- Customer data (never shared)
- Specific outputs (never shared)

See `docs/PRIVACY-MODEL.md` for full details.

## Metrics

Daily report shows:
- **Patterns adopted** — which tribe members' approaches you're using
- **Token savings** — cost reduction from shared patterns
- **Quality gains** — execution speed or output quality improvements
- **Tribe contribution** — which patterns you shared that helped others

See `docs/METRICS.md` for full spec.

## Invite Your Tribe

```bash
openclaw clawnet invite brenden dar
```

This:
1. Shares their public keys with each other
2. Starts gossip automatically
3. Reports begin next day

## FAQ

**Q: Will my OpenClaw share my MEMORY.md?**
No. Never. Only your interest graph (what you care about) and distilled patterns (how you approach problems).

**Q: What if someone tries to steal data through a pattern?**
ClawMoat scans every incoming pattern for credentials, PII, and domain names. Suspicious patterns are quarantined. You get an alert.

**Q: Can I control what interests are shared?**
Yes. `openclaw clawnet edit-profile` lets you approve/reject specific interests before they're published.

**Q: What if I want to leave the network?**
```bash
openclaw clawnet disconnect
```
Your claw stops gossiping. Existing patterns remain local. You can rejoin anytime.

**Q: Is there a central server?**
No. Gossip is peer-to-peer via mTLS key exchange. You control who you connect to.

## For Developers

See `ARCHITECTURE.md` for the full protocol spec.

TL;DR:
- Gossip protocol: SWIM-style convergence
- Storage: CRDT (Automerge) for conflict-free merges
- Safety: ClawMoat scanner on all inbound
- Encoding: Semantic embeddings (not raw text)

## Contact

Questions? Issues? Ideas?
- GitHub issues: [clawnet-mvp/issues](https://github.com/ucsdsu/clawnet-mvp/issues)
- Twitter: [@jonstenstrom](https://twitter.com/jonstenstrom)

---

**Status:** MVP, 2-week validation with trusted network. This is early. Feedback welcome.

Built by Wick + friends. Let your tribe help you win.
