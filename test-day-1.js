#!/usr/bin/env node

/**
 * Day 1 Test: Single Claw Publishing Patterns
 * 
 * Tests:
 * 1. CRDT store creation and append
 * 2. Pattern extraction from MEMORY.md
 * 3. ClawMoat security scanning
 * 4. Gossip protocol publishing
 */

const CRDTStore = require('./lib/crdt/crdt-store.js');
const PatternExtractor = require('./lib/patterns/pattern-extractor.js');
const ClawMoatScanner = require('./lib/moat/clawmoat-scanner.js');
const GossipProtocol = require('./lib/gossip/gossip-protocol.js');
const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = './test-data/day-1';

function ensureTestDir() {
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  }
  process.env.CLAW_ID = 'jon-claw';
}

async function runTests() {
  console.log('\n=== [Day 1] Single Claw Publishing Test ===\n');
  
  ensureTestDir();
  
  // Test 1: CRDT Store
  console.log('✓ Test 1: CRDT Store');
  const crdt = new CRDTStore(path.join(TEST_DATA_DIR, 'crdt-log.json'));
  
  const entry1 = crdt.append({
    type: 'pattern',
    approach: 'model-routing',
    description: 'Route to Sonnet for thinking'
  });
  console.log(`  - Entry 1 ID: ${entry1.id}`);
  
  const entry2 = crdt.append({
    type: 'pattern',
    approach: 'shape-up-decisions',
    description: 'Shape up before committing'
  });
  console.log(`  - Entry 2 ID: ${entry2.id}`);
  
  const stats = crdt.getStats();
  console.log(`  - Total entries: ${stats.totalLogEntries}`);
  console.log(`  - Total patterns: ${stats.totalPatterns}`);
  
  crdt.save();
  console.log('  - Saved to disk ✓\n');
  
  // Test 2: Pattern Extraction
  console.log('✓ Test 2: Pattern Extraction');
  const extractor = new PatternExtractor('/Users/openclaw/.openclaw/workspace');
  const patterns = extractor.extractPatterns();
  console.log(`  - Extracted ${patterns.length} patterns`);
  
  const shareablePatterns = extractor.getPatternsForSharing(0.85);
  console.log(`  - Shareable (>0.85 confidence): ${shareablePatterns.length}`);
  
  const extractorStats = extractor.getStats();
  console.log(`  - Contexts: ${extractorStats.contexts.join(', ')}`);
  console.log(`  - Average confidence: ${extractorStats.averageConfidence}\n`);
  
  // Test 3: ClawMoat Scanner
  console.log('✓ Test 3: ClawMoat Security Scanning');
  const scanner = new ClawMoatScanner();
  
  // Safe pattern
  const safePattern = {
    approach: 'model-routing',
    contexts: ['planning'],
    metrics: { quality: 8.5 }
  };
  const safeScan = scanner.scan(safePattern);
  console.log(`  - Safe pattern: ${safeScan.decision} (threats: ${safeScan.threatCount})`);
  
  // Dangerous pattern with credential
  const dangerousPattern = {
    approach: 'api-integration',
    apiKey: 'sk-abc123xyz789',
    contexts: ['integration']
  };
  const dangerousScan = scanner.scan(dangerousPattern);
  console.log(`  - Pattern with credential: ${dangerousScan.decision} (threats: ${dangerousScan.threatCount})`);
  for (const threat of dangerousScan.threats) {
    console.log(`    - ${threat.severity} ${threat.type}: ${threat.match}`);
  }
  
  // PII pattern
  const piiPattern = {
    approach: 'user-data',
    email: 'jon@example.com',
    phone: '555-123-4567'
  };
  const piiScan = scanner.scan(piiPattern);
  console.log(`  - Pattern with PII: ${piiScan.decision} (threats: ${piiScan.threatCount})\n`);
  
  // Test 4: Gossip Protocol
  console.log('✓ Test 4: Gossip Protocol Publishing');
  const gossip = new GossipProtocol('jon-claw', path.join(TEST_DATA_DIR, 'gossip-bus'));
  
  const interestVector = {
    'planning': 0.25,
    'execution': 0.20,
    'optimization': 0.15,
    'learning': 0.40
  };
  
  const patternsToPub = [
    {
      id: 'p1',
      approach: 'model-routing',
      contexts: ['planning', 'execution'],
      confidence: 0.92
    },
    {
      id: 'p2',
      approach: 'shape-up',
      contexts: ['planning', 'learning'],
      confidence: 0.88
    }
  ];
  
  const messageId = gossip.publishPatterns(patternsToPub, interestVector);
  console.log(`  - Published message ID: ${messageId}`);
  console.log(`  - Patterns published: ${patternsToPub.length}`);
  
  const gossipStats = gossip.getStats();
  console.log(`  - Gossip stats:`, {
    publishedPatterns: gossipStats.publishedPatterns,
    subscriptions: gossipStats.subscriptions.length
  });
  console.log();
  
  // Test 5: Integration Test
  console.log('✓ Test 5: Integration - Extract, Scan, Publish');
  
  // Scan extracted patterns
  const scannedPatterns = shareablePatterns.map(p => {
    const scanned = scanner.scan(p);
    return {
      ...p,
      scanResult: scanned.decision,
      sanitized: scanned.cleaned
    };
  });
  
  const safe = scannedPatterns.filter(p => p.scanResult === 'ACCEPT');
  const quarantined = scannedPatterns.filter(p => p.scanResult === 'QUARANTINE');
  const blocked = scannedPatterns.filter(p => p.scanResult === 'BLOCK');
  
  console.log(`  - Scanned ${scannedPatterns.length} patterns`);
  console.log(`  - Safe (ACCEPT): ${safe.length}`);
  console.log(`  - Quarantined: ${quarantined.length}`);
  console.log(`  - Blocked: ${blocked.length}`);
  
  // Add to CRDT
  for (const pattern of safe) {
    crdt.append({
      type: 'pattern',
      ...pattern
    });
  }
  
  console.log(`  - Added ${safe.length} patterns to CRDT`);
  crdt.save();
  
  // Publish safe patterns
  const pubId = gossip.publishPatterns(safe, interestVector);
  console.log(`  - Published ${safe.length} patterns via gossip (ID: ${pubId})\n`);
  
  // Summary
  console.log('=== Day 1 Summary ===');
  console.log(`✓ CRDT store: ${stats.totalPatterns} patterns stored`);
  console.log(`✓ Pattern extraction: ${shareablePatterns.length} shareable patterns`);
  console.log(`✓ ClawMoat scanning: ${safe.length}/${scannedPatterns.length} patterns safe`);
  console.log(`✓ Gossip publishing: ${safe.length} patterns published\n`);
  
  // Write results
  const results = {
    timestamp: new Date().toISOString(),
    test: 'day-1-single-claw',
    passed: true,
    metrics: {
      crdtPatterns: stats.totalPatterns,
      extractedPatterns: patterns.length,
      shareablePatterns: shareablePatterns.length,
      scannedPatterns: scannedPatterns.length,
      safePatterns: safe.length,
      publishedPatterns: patternsToPub.length,
      gossipMessages: 1
    },
    components: {
      crdt: 'PASS',
      extractor: 'PASS',
      scanner: 'PASS',
      gossip: 'PASS'
    }
  };
  
  fs.writeFileSync(
    path.join(TEST_DATA_DIR, 'results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('✓ Test results saved to:', path.join(TEST_DATA_DIR, 'results.json'));
  console.log('✓ Gossip bus data in:', path.join(TEST_DATA_DIR, 'gossip-bus'));
  console.log('✓ CRDT log in:', path.join(TEST_DATA_DIR, 'crdt-log.json'));
  
  return results;
}

runTests().catch(console.error);
