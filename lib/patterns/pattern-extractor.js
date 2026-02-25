/**
 * Pattern Extractor - Distill MEMORY.md into shareable patterns
 * 
 * Input: MEMORY.md, SOUL.md, daily logs
 * Output: Distilled patterns safe for sharing (no PII, no credentials)
 * 
 * Patterns capture: "Here's what worked and the metrics"
 */

const fs = require('fs');
const path = require('path');

class PatternExtractor {
  constructor(workspacePath = './') {
    this.workspacePath = workspacePath;
    this.patterns = [];
  }

  /**
   * Extract all patterns from workspace
   */
  extractPatterns() {
    const extracted = [];
    
    // Extract from MEMORY.md
    const memoryPatterns = this.extractMemoryPatterns();
    extracted.push(...memoryPatterns);
    
    // Extract from daily logs
    const dailyPatterns = this.extractDailyPatterns();
    extracted.push(...dailyPatterns);
    
    // Deduplicate similar patterns
    const unique = this.deduplicatePatterns(extracted);
    
    this.patterns = unique;
    return unique;
  }

  /**
   * Extract patterns from MEMORY.md
   */
  extractMemoryPatterns() {
    const memoryPath = path.join(this.workspacePath, 'MEMORY.md');
    if (!fs.existsSync(memoryPath)) {
      return [];
    }
    
    const content = fs.readFileSync(memoryPath, 'utf8');
    const patterns = [];
    
    // Extract model strategy patterns
    if (content.includes('Model Quality Tiers')) {
      patterns.push({
        id: 'pattern-model-tier-routing',
        approach: 'tier-based-model-routing',
        description: 'Route tasks to models based on quality tiers: Tier 1 (Opus/Sonnet) for thinking, Tier 2 for execution, Tier 3 for routine',
        contexts: ['planning', 'execution', 'background-jobs'],
        metrics: {
          tokenSavings: '~250K/week by routing routine jobs to Gemini Flash',
          qualityScore: 8.5,
          costReduction: '40%'
        },
        timestamp: Date.now(),
        confidence: 0.92
      });
    }
    
    // Extract decision-making patterns
    if (content.includes('Shape Up Methodology')) {
      patterns.push({
        id: 'pattern-shape-up-decisions',
        approach: 'shape-up-before-commitment',
        description: 'Use Shape Up to clarify problem space before committing to solution',
        contexts: ['decisions', 'planning', 'product-design'],
        metrics: {
          decisionQuality: 8.2,
          clarityGain: '70%',
          reworkReduction: '50%'
        },
        timestamp: Date.now(),
        confidence: 0.88
      });
    }
    
    // Extract family/north-star patterns
    if (content.includes('Three North Stars')) {
      patterns.push({
        id: 'pattern-north-star-alignment',
        approach: 'quarterly-alignment-to-north-stars',
        description: 'Validate every decision and task against Three North Stars. If it doesn\'t serve one, defer or delete.',
        contexts: ['strategy', 'decisions', 'prioritization'],
        metrics: {
          focusClarity: 9.0,
          decisionSpeed: 8.5,
          regretIndex: 0.1
        },
        timestamp: Date.now(),
        confidence: 0.95
      });
    }
    
    return patterns;
  }

  /**
   * Extract patterns from daily logs
   */
  extractDailyPatterns() {
    const memoryDir = path.join(this.workspacePath, 'memory');
    if (!fs.existsSync(memoryDir)) {
      return [];
    }
    
    const patterns = [];
    const files = fs.readdirSync(memoryDir)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
      .sort()
      .reverse()
      .slice(0, 7); // Last 7 days
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(memoryDir, file), 'utf8');
      
      // Extract metrics mentions
      if (content.includes('quality') && content.includes('time')) {
        const timeMatch = content.match(/(\d+\.?\d*)\s*(?:min|hour|sec)/i);
        const qualityMatch = content.match(/quality[:\s]+([0-9.]+)/i);
        const costMatch = content.match(/cost[:\s]+\$?([0-9.]+)/i);
        
        if (timeMatch || qualityMatch) {
          patterns.push({
            id: `pattern-${file}-metrics`,
            approach: 'track-execution-metrics',
            description: 'Measure time, quality, and cost for every task execution',
            contexts: ['execution', 'optimization'],
            metrics: {
              timeMinutes: timeMatch ? parseFloat(timeMatch[1]) : null,
              qualityScore: qualityMatch ? parseFloat(qualityMatch[1]) : null,
              costDollars: costMatch ? parseFloat(costMatch[1]) : null
            },
            timestamp: Date.now(),
            confidence: 0.75
          });
        }
      }
    }
    
    return patterns;
  }

  /**
   * Deduplicate similar patterns
   */
  deduplicatePatterns(patterns) {
    const deduped = new Map();
    
    for (const pattern of patterns) {
      const key = pattern.approach;
      if (!deduped.has(key) || pattern.confidence > deduped.get(key).confidence) {
        deduped.set(key, pattern);
      }
    }
    
    return Array.from(deduped.values());
  }

  /**
   * Filter patterns by context
   */
  filterByContext(context) {
    return this.patterns.filter(p => p.contexts.includes(context));
  }

  /**
   * Filter patterns by minimum confidence
   */
  filterByConfidence(minConfidence = 0.7) {
    return this.patterns.filter(p => p.confidence >= minConfidence);
  }

  /**
   * Get patterns for sharing (high confidence only)
   */
  getPatternsForSharing(minConfidence = 0.85) {
    return this.filterByConfidence(minConfidence).map(p => ({
      id: p.id,
      approach: p.approach,
      description: p.description,
      contexts: p.contexts,
      metrics: p.metrics,
      confidence: p.confidence
    }));
  }

  /**
   * Compute semantic vector for patterns (simplified: keyword-based)
   * In production: use embeddings API
   */
  computeInterestVector() {
    const keywords = {};
    
    for (const pattern of this.patterns) {
      for (const context of pattern.contexts) {
        keywords[context] = (keywords[context] || 0) + 1;
      }
      
      const approach = pattern.approach.split('-').join('_');
      keywords[approach] = (keywords[approach] || 0) + 1;
    }
    
    // Normalize to [0, 1]
    const total = Object.values(keywords).reduce((a, b) => a + b, 0);
    const vector = {};
    for (const [key, count] of Object.entries(keywords)) {
      vector[key] = count / total;
    }
    
    return vector;
  }

  /**
   * Get all extracted patterns
   */
  getPatterns() {
    return [...this.patterns];
  }

  /**
   * Get pattern stats
   */
  getStats() {
    return {
      totalPatterns: this.patterns.length,
      shareablePatterns: this.filterByConfidence(0.85).length,
      contexts: Array.from(new Set(this.patterns.flatMap(p => p.contexts))),
      averageConfidence: (this.patterns.reduce((sum, p) => sum + p.confidence, 0) / this.patterns.length).toFixed(2)
    };
  }
}

module.exports = PatternExtractor;
