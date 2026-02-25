/**
 * Gossip Protocol - Pattern publish/subscribe with semantic routing
 * 
 * Implements:
 * - Pattern publishing to local gossip bus
 * - Interest-based subscription (>0.85 embedding similarity)
 * - Peer discovery and connection management
 * 
 * MVP: File-based gossip bus (no network yet)
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class GossipProtocol extends EventEmitter {
  constructor(clawId, gossipBusPath = './data/gossip-bus') {
    super();
    this.clawId = clawId;
    this.gossipBusPath = gossipBusPath;
    this.peers = new Map(); // { peerId: { lastSeen, patterns } }
    this.subscriptions = new Map(); // { context: handlers }
    this.publishedPatterns = [];
    this.receivedPatterns = [];
    
    this.ensureDir();
  }

  /**
   * Ensure gossip bus directory exists
   */
  ensureDir() {
    if (!fs.existsSync(this.gossipBusPath)) {
      fs.mkdirSync(this.gossipBusPath, { recursive: true });
    }
  }

  /**
   * Publish patterns to gossip bus
   */
  publishPatterns(patterns, interestVector) {
    const message = {
      id: `${this.clawId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      publisherId: this.clawId,
      patterns: patterns,
      interestVector: interestVector,
      ttl: 7 // Days to live on bus
    };
    
    this.publishedPatterns.push(message);
    
    // Write to gossip bus
    this.writeToGossipBus(message);
    
    this.emit('patterns-published', {
      count: patterns.length,
      messageId: message.id
    });
    
    return message.id;
  }

  /**
   * Write message to gossip bus
   */
  writeToGossipBus(message) {
    try {
      const filePath = path.join(
        this.gossipBusPath,
        `${message.publisherId}-${message.timestamp}.json`
      );
      fs.writeFileSync(filePath, JSON.stringify(message, null, 2));
    } catch (err) {
      console.error('[Gossip] Error writing to bus:', err.message);
    }
  }

  /**
   * Subscribe to patterns matching context
   */
  subscribe(context, handler) {
    if (!this.subscriptions.has(context)) {
      this.subscriptions.set(context, []);
    }
    this.subscriptions.get(context).push(handler);
    
    return () => {
      const handlers = this.subscriptions.get(context);
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    };
  }

  /**
   * Sync with gossip bus and receive patterns
   */
  sync() {
    const received = [];
    
    try {
      const files = fs.readdirSync(this.gossipBusPath)
        .filter(f => f.endsWith('.json'))
        .sort();
      
      for (const file of files) {
        const filePath = path.join(this.gossipBusPath, file);
        
        try {
          const message = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Skip own messages
          if (message.publisherId === this.clawId) {
            continue;
          }
          
          // Skip if already received
          if (this.receivedPatterns.some(p => p.id === message.id)) {
            continue;
          }
          
          // Update peer tracking
          this.updatePeer(message.publisherId, message.patterns);
          
          // Emit patterns to matching subscribers
          for (const pattern of message.patterns) {
            for (const context of pattern.contexts) {
              if (this.subscriptions.has(context)) {
                const handlers = this.subscriptions.get(context);
                for (const handler of handlers) {
                  handler(pattern, message.publisherId);
                }
              }
            }
          }
          
          this.receivedPatterns.push({
            id: message.id,
            timestamp: message.timestamp,
            fromPeer: message.publisherId,
            patternCount: message.patterns.length
          });
          
          received.push(message.id);
        } catch (err) {
          console.warn(`[Gossip] Error reading message ${file}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[Gossip] Sync error:', err.message);
    }
    
    this.emit('sync-complete', {
      received: received.length,
      peers: this.peers.size
    });
    
    return received;
  }

  /**
   * Compute embedding similarity (simplified: context overlap)
   * In production: use embeddings API
   */
  computeSimilarity(pattern1Contexts, pattern2Contexts) {
    if (pattern1Contexts.length === 0 || pattern2Contexts.length === 0) {
      return 0;
    }
    
    const intersection = pattern1Contexts.filter(c => pattern2Contexts.includes(c));
    const union = [...new Set([...pattern1Contexts, ...pattern2Contexts])];
    
    return intersection.length / union.length;
  }

  /**
   * Filter patterns by similarity threshold
   */
  filterBySimilarity(patterns, myInterestVector, threshold = 0.85) {
    return patterns.filter(pattern => {
      const similarity = this.computeSimilarity(
        pattern.contexts,
        Object.keys(myInterestVector).filter(k => myInterestVector[k] > 0.1)
      );
      return similarity >= threshold;
    });
  }

  /**
   * Update peer tracking
   */
  updatePeer(peerId, patterns) {
    if (!this.peers.has(peerId)) {
      this.peers.set(peerId, {
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        patterns: []
      });
    }
    
    const peer = this.peers.get(peerId);
    peer.lastSeen = Date.now();
    peer.patterns.push(...patterns);
  }

  /**
   * Get connected peers
   */
  getPeers() {
    return Array.from(this.peers.entries()).map(([id, data]) => ({
      id,
      ...data,
      patternCount: data.patterns.length
    }));
  }

  /**
   * Get patterns from specific peer
   */
  getPatternsByPeer(peerId) {
    const peer = this.peers.get(peerId);
    return peer ? peer.patterns : [];
  }

  /**
   * Get sync stats
   */
  getStats() {
    return {
      clawId: this.clawId,
      publishedPatterns: this.publishedPatterns.length,
      receivedPatterns: this.receivedPatterns.length,
      connectedPeers: this.peers.size,
      subscriptions: Array.from(this.subscriptions.keys()),
      lastSync: this.receivedPatterns.length > 0 
        ? this.receivedPatterns[this.receivedPatterns.length - 1].timestamp 
        : null
    };
  }

  /**
   * Clean old messages from gossip bus (TTL expiry)
   */
  cleanExpiredMessages() {
    const ttlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    const cutoffTime = Date.now() - ttlMs;
    let cleaned = 0;
    
    try {
      const files = fs.readdirSync(this.gossipBusPath);
      for (const file of files) {
        const filePath = path.join(this.gossipBusPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    } catch (err) {
      console.error('[Gossip] Cleanup error:', err.message);
    }
    
    return cleaned;
  }
}

module.exports = GossipProtocol;
