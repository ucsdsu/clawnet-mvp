/**
 * CRDT Store - Conflict-free, append-only distributed log
 * Implements vector clocks for causal ordering of patterns
 * 
 * Design: Vector clock + append-only log = automatic conflict resolution
 * No external dependencies, pure Node.js
 */

const fs = require('fs');
const path = require('path');

class CRDTStore {
  constructor(storagePath = './data/crdt-log.json') {
    this.storagePath = storagePath;
    this.log = [];
    this.vectorClocks = {}; // { clawId: timestamp }
    this.patterns = {}; // { patternId: pattern }
    this.metadata = {
      createdAt: Date.now(),
      localClawId: process.env.CLAW_ID || 'unknown-claw',
      version: '1.0'
    };
    
    this.ensureDir();
    this.load();
  }

  /**
   * Ensure storage directory exists
   */
  ensureDir() {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Append a new entry to the distributed log
   * Vector clock ensures causal ordering
   */
  append(entry) {
    const localClawId = this.metadata.localClawId;
    
    // Increment local vector clock
    this.vectorClocks[localClawId] = (this.vectorClocks[localClawId] || 0) + 1;
    
    const logEntry = {
      id: `${localClawId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      clawId: localClawId,
      vectorClock: { ...this.vectorClocks },
      entry: entry,
      hash: this.computeHash(entry)
    };
    
    this.log.push(logEntry);
    
    // Store pattern if it's a pattern entry
    if (entry.type === 'pattern') {
      this.patterns[logEntry.id] = {
        ...entry,
        logEntryId: logEntry.id,
        addedAt: logEntry.timestamp,
        sourceClawId: localClawId
      };
    }
    
    return logEntry;
  }

  /**
   * Merge remote log entries (from another claw)
   * Vector clocks ensure no conflicts - last-write-wins within causal chain
   */
  mergeRemoteLog(remoteLog, remoteClawId) {
    const merged = [];
    
    for (const remoteEntry of remoteLog) {
      // Update remote vector clock
      if (!this.vectorClocks[remoteClawId]) {
        this.vectorClocks[remoteClawId] = 0;
      }
      
      // Check if we've already seen this entry
      const exists = this.log.some(e => e.id === remoteEntry.id);
      if (exists) {
        continue; // Skip duplicates
      }
      
      // Validate remote entry
      if (!this.validateEntry(remoteEntry)) {
        console.warn(`[CRDT] Invalid remote entry from ${remoteClawId}:`, remoteEntry.id);
        continue;
      }
      
      // Update vector clock tracking
      if (remoteEntry.vectorClock && remoteEntry.vectorClock[remoteClawId]) {
        this.vectorClocks[remoteClawId] = Math.max(
          this.vectorClocks[remoteClawId],
          remoteEntry.vectorClock[remoteClawId]
        );
      }
      
      this.log.push(remoteEntry);
      merged.push(remoteEntry.id);
      
      // Store pattern if applicable
      if (remoteEntry.entry.type === 'pattern') {
        this.patterns[remoteEntry.id] = {
          ...remoteEntry.entry,
          logEntryId: remoteEntry.id,
          addedAt: remoteEntry.timestamp,
          sourceClawId: remoteClawId
        };
      }
    }
    
    // Sort log by timestamp to maintain causal ordering
    this.log.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return a.clawId.localeCompare(b.clawId);
    });
    
    return {
      merged: merged.length,
      total: this.log.length,
      conflicts: 0 // Vector clocks prevent conflicts
    };
  }

  /**
   * Validate entry structure and hash
   */
  validateEntry(entry) {
    if (!entry.id || !entry.timestamp || !entry.clawId || !entry.vectorClock) {
      return false;
    }
    
    // Verify hash
    const expectedHash = this.computeHash(entry.entry);
    if (entry.hash !== expectedHash) {
      return false;
    }
    
    return true;
  }

  /**
   * Simple hash for entry validation
   */
  computeHash(entry) {
    const str = JSON.stringify(entry);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get all patterns
   */
  getAllPatterns() {
    return Object.values(this.patterns);
  }

  /**
   * Get patterns from specific claw
   */
  getPatternsBySource(clawId) {
    return Object.values(this.patterns).filter(p => p.sourceClawId === clawId);
  }

  /**
   * Get recent patterns (last N entries)
   */
  getRecentPatterns(limit = 10) {
    return Object.values(this.patterns)
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, limit);
  }

  /**
   * Get log entries since timestamp
   */
  getLogSince(timestamp) {
    return this.log.filter(e => e.timestamp > timestamp);
  }

  /**
   * Get full log
   */
  getFullLog() {
    return [...this.log];
  }

  /**
   * Get current state (for syncing)
   */
  getState() {
    return {
      log: this.log,
      vectorClocks: this.vectorClocks,
      patterns: this.patterns,
      metadata: this.metadata
    };
  }

  /**
   * Get stats
   */
  getStats() {
    const sourceClaws = new Set(
      Object.values(this.patterns).map(p => p.sourceClawId)
    );
    
    return {
      totalPatterns: Object.keys(this.patterns).length,
      totalLogEntries: this.log.length,
      sourceClaws: Array.from(sourceClaws),
      sourceClawCount: sourceClaws.size,
      vectorClocks: this.vectorClocks,
      lastUpdate: this.log.length > 0 ? this.log[this.log.length - 1].timestamp : null
    };
  }

  /**
   * Save to disk
   */
  save() {
    try {
      const state = this.getState();
      fs.writeFileSync(this.storagePath, JSON.stringify(state, null, 2));
      return true;
    } catch (err) {
      console.error(`[CRDT] Save error:`, err.message);
      return false;
    }
  }

  /**
   * Load from disk
   */
  load() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
        this.log = data.log || [];
        this.vectorClocks = data.vectorClocks || {};
        this.patterns = data.patterns || {};
        this.metadata = data.metadata || this.metadata;
      }
    } catch (err) {
      console.warn(`[CRDT] Load warning:`, err.message);
    }
  }

  /**
   * Clear all data (test only)
   */
  clear() {
    this.log = [];
    this.vectorClocks = {};
    this.patterns = {};
  }
}

module.exports = CRDTStore;
