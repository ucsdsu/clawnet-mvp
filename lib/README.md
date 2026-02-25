# Claw Gossip Library Modules

Core implementation of the Claw Gossip protocol for federated OpenClaw instances.

## Modules

### `crdt/` - Conflict-Free Replicated Data Type
**File:** `crdt/crdt-store.js`  
**Size:** 6.6 KB  
**Purpose:** Append-only distributed log with vector clocks for conflict-free merging

```javascript
const CRDTStore = require('./crdt/crdt-store.js');
const store = new CRDTStore('./data/crdt-log.json');

// Append local entries
store.append({ type: 'pattern', approach: 'model-routing' });

// Merge remote log (automatic conflict resolution)
const result = store.mergeRemoteLog(remoteLog, 'remote-claw-id');

// Query
store.getAllPatterns();
store.getPatternsBySource('peer-id');
store.getStats();
```

**Key Features:**
- Vector clock tracking (causal ordering)
- Hash validation (integrity checking)
- Append-only log (immutability)
- Disk persistence (JSON-based)
- No conflicts (automatic resolution)

---

### `patterns/` - Pattern Management
#### Pattern Extractor
**File:** `patterns/pattern-extractor.js`  
**Size:** 6.9 KB  
**Purpose:** Distill MEMORY.md and daily logs into shareable patterns

```javascript
const PatternExtractor = require('./patterns/pattern-extractor.js');
const extractor = new PatternExtractor('./workspace/');

// Extract from MEMORY.md and logs
const patterns = extractor.extractPatterns();

// Filter by confidence
const shareable = extractor.getPatternsForSharing(0.85);

// Get interest vector
const vector = extractor.computeInterestVector();

// Get stats
extractor.getStats();
```

**Key Features:**
- MEMORY.md parsing
- Daily log extraction
- Confidence scoring (0-1)
- Deduplication
- Interest vector computation

#### Pattern Applier
**File:** `patterns/pattern-applier.js`  
**Size:** 6.6 KB  
**Purpose:** Auto-adopt patterns with quality floor enforcement

```javascript
const PatternApplier = require('./patterns/pattern-applier.js');
const applier = new PatternApplier();

// Apply a pattern
const result = applier.applyPattern(
  pattern,
  { quality: 6.5, timeMinutes: 10, tokens: 200 }
);

if (result.applied) {
  console.log('Improvements:', result.improvements);
  // → { tokensSaved: 140, timeSaved: 5, qualityGain: 1.5 }
}

// Get metrics
applier.getMetrics();
applier.getHistory();
```

**Key Features:**
- Confidence threshold (>0.85)
- Quality floor (≥7.0/10)
- Improvement estimation
- ROI calculation
- Adoption tracking

---

### `moat/` - Security Scanning
**File:** `moat/clawmoat-scanner.js`  
**Size:** 6.6 KB  
**Purpose:** Scan patterns for credentials, PII, and threats before storage

```javascript
const ClawMoatScanner = require('./moat/clawmoat-scanner.js');
const scanner = new ClawMoatScanner();

// Scan a pattern
const result = scanner.scan(pattern);
// → { decision: 'ACCEPT', threats: [], cleaned: {...}, threatCount: 0 }

// Batch scan
const results = scanner.scanBatch([pattern1, pattern2, ...]);

// Decision types
// ACCEPT: Safe to share
// QUARANTINE: Suspicious, needs human review
// BLOCK: Dangerous, do not store
```

**Threats Detected:**
- Credentials: API keys, passwords, tokens, JWT
- PII: Emails, phone numbers, SSNs, ZIP+4
- Domains: example.com → [DOMAIN-REDACTED]
- Encoding: Base64, hex hashes

**Key Features:**
- Multi-pattern regex scanning
- Threat classification (HIGH/MEDIUM/LOW)
- Automatic sanitization
- Decision logic (ACCEPT/QUARANTINE/BLOCK)
- Batch processing

---

### `gossip/` - Protocol & Networking
**File:** `gossip/gossip-protocol.js`  
**Size:** 7.0 KB  
**Purpose:** Pattern pub/sub with semantic interest routing

```javascript
const GossipProtocol = require('./gossip/gossip-protocol.js');
const gossip = new GossipProtocol('my-claw-id', './data/gossip-bus');

// Subscribe to patterns matching context
gossip.subscribe('planning', (pattern, fromPeerId) => {
  console.log(`Received from ${fromPeerId}:`, pattern.approach);
});

// Publish patterns with interest vector
gossip.publishPatterns(
  [pattern1, pattern2],
  { planning: 0.3, execution: 0.2, learning: 0.5 }
);

// Sync with peers
const received = gossip.sync();

// Query peers
gossip.getPeers();
gossip.getPatternsByPeer('peer-id');
```

**Key Features:**
- File-based gossip bus (MVP)
- Pattern publishing/subscription
- Peer discovery & tracking
- Similarity-based filtering
- TTL-based message expiration
- Cleanup & maintenance

---

### `metrics/` - Reporting & Analytics
**File:** `metrics/report-generator.js`  
**Size:** 9.1 KB  
**Purpose:** Daily metrics, before/after comparison, peer contribution analysis

```javascript
const ReportGenerator = require('./metrics/report-generator.js');
const generator = new ReportGenerator('my-claw-id');

// Generate daily report
const daily = generator.generateDailyReport(dayNumber, {
  crdtStore, gossipProtocol, patternApplier, patternExtractor
});

// Before/after comparison
const comparison = generator.generateBeforeAfterReport(
  beforeState, afterState, dayNumber
);

// Peer contributions
const contributions = generator.generatePeerContributionReport(crdtStore);

// Quarterly rollup
const quarterly = generator.generateQuarterlyRollup(dayReports);

// CSV export
const csv = generator.generateMetricsCSV(reports);

// Markdown formatting
const markdown = generator.formatMarkdown(report);
```

**Metrics Tracked:**
- Patterns published/received/applied
- Tokens saved, time saved, quality gains
- Adoption rate, peer contributions
- Security incidents, quality floor violations

**Key Features:**
- Multi-level reporting (daily/before-after/peer/quarterly)
- Aggregation & averaging
- CSV & markdown export
- ROI calculation
- Trend analysis

---

## Usage Example

### Full Integration
```javascript
const CRDTStore = require('./crdt/crdt-store.js');
const PatternExtractor = require('./patterns/pattern-extractor.js');
const ClawMoatScanner = require('./moat/clawmoat-scanner.js');
const GossipProtocol = require('./gossip/gossip-protocol.js');
const PatternApplier = require('./patterns/pattern-applier.js');
const ReportGenerator = require('./metrics/report-generator.js');

// Initialize
const crdt = new CRDTStore('./data/crdt-log.json');
const extractor = new PatternExtractor('./workspace/');
const scanner = new ClawMoatScanner();
const gossip = new GossipProtocol('my-claw', './data/gossip-bus');
const applier = new PatternApplier();
const reporter = new ReportGenerator('my-claw');

// Daily sync workflow
(async () => {
  // 1. Extract local patterns
  const patterns = extractor.extractPatterns();
  const shareable = extractor.getPatternsForSharing(0.85);
  
  // 2. Security gate
  const safe = shareable.filter(p => scanner.scan(p).decision === 'ACCEPT');
  
  // 3. Publish
  gossip.publishPatterns(safe, extractor.computeInterestVector());
  
  // 4. Sync with peers
  gossip.sync();
  
  // 5. Subscribe and apply
  gossip.subscribe('planning', (pattern, fromPeer) => {
    const result = applier.applyPattern(pattern, {
      quality: 6.5, timeMinutes: 10, tokens: 200
    });
    if (result.applied) {
      crdt.append({ type: 'pattern', ...pattern, adoptedFrom: fromPeer });
    }
  });
  
  // 6. Persist
  crdt.save();
  
  // 7. Report
  const report = reporter.generateDailyReport(1, {
    crdtStore: crdt,
    gossipProtocol: gossip,
    patternApplier: applier,
    patternExtractor: extractor
  });
  console.log(reporter.formatMarkdown(report));
})();
```

---

## Architecture

```
User's MEMORY.md
    ↓
PatternExtractor (distill + confidence)
    ↓ (shareable patterns)
ClawMoatScanner (security gate: ACCEPT/BLOCK)
    ↓ (safe patterns)
GossipProtocol (publish to gossip bus)
    ↓
[Gossip Bus - shared filesystem or broker]
    ↓
GossipProtocol (sync, subscribe, filter by similarity)
    ↓ (received patterns)
ClawMoatScanner (verify safety again)
    ↓
PatternApplier (check confidence + quality floor)
    ↓ (adopted patterns)
CRDTStore (append with vector clock, merge if conflicts)
    ↓
ReportGenerator (metrics: before/after, adoption, ROI)
```

---

## Design Principles

1. **Zero Dependencies** - Pure Node.js built-ins only
2. **Modular** - Each module has single responsibility
3. **Explicit** - No magic, behavior is clear
4. **Fail-Safe** - Quality floor prevents degradation
5. **Composable** - Modules work independently or together
6. **Testable** - No external state, pure functions

---

## Testing

Run tests:
```bash
node test-day-1.js      # Single claw publishing
node test-integration.js # 3-claw 7-day simulation
```

---

## Performance Notes

- **Storage:** ~6.6 KB per module
- **Memory:** <10 MB for 1000+ patterns
- **Speed:** <100ms per daily sync
- **Scalability:** File-based up to 3-5 claws, use broker for >10

---

## Future Phases

- **Phase 2:** mTLS encryption, pub/sub broker, DHT
- **Phase 3:** Reputation scoring, recommendation engine
- **Phase 4:** Web UI, pattern search, analytics dashboard

---

See `IMPLEMENTATION-REPORT.md` for complete architecture & metrics.
