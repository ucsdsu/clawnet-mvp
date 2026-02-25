/**
 * Pattern Applier - Auto-adopt patterns into execution workflow
 * 
 * Measures:
 * - Pattern adoption rate
 * - Quality improvement (before/after)
 * - Time savings
 * - Cost impact
 */

class PatternApplier {
  constructor() {
    this.appliedPatterns = [];
    this.metrics = {
      tokensSavedCum: 0,
      timeSavedCum: 0,
      qualityGainsCum: 0,
      adoptionCount: 0,
      totalExposures: 0
    };
    this.history = []; // Timeline of adoptions
  }

  /**
   * Apply a pattern if it meets quality threshold
   * Quality floor: 7.0/10
   */
  applyPattern(pattern, beforeMetrics, fromPeerId = 'local') {
    // Validate confidence
    if (pattern.confidence < 0.85) {
      return {
        applied: false,
        reason: 'confidence-too-low',
        confidence: pattern.confidence
      };
    }
    
    // Validate quality score exists and is >= 7.0
    const qualityScore = pattern.metrics?.qualityScore || 0;
    if (qualityScore < 7.0) {
      return {
        applied: false,
        reason: 'quality-floor-not-met',
        quality: qualityScore,
        floor: 7.0
      };
    }
    
    // Calculate expected improvements
    const improvements = this.estimateImprovements(pattern, beforeMetrics);
    
    if (improvements.expectedQuality < 7.0) {
      return {
        applied: false,
        reason: 'would-degrade-quality',
        expectedQuality: improvements.expectedQuality
      };
    }
    
    // Apply the pattern
    const adoption = {
      patternId: pattern.id,
      approach: pattern.approach,
      timestamp: Date.now(),
      fromPeerId: fromPeerId,
      beforeMetrics: beforeMetrics,
      estimatedImprovements: improvements,
      confidence: pattern.confidence,
      quality: qualityScore
    };
    
    this.appliedPatterns.push(adoption);
    this.history.push({
      type: 'adoption',
      timestamp: adoption.timestamp,
      pattern: adoption.approach,
      metrics: improvements
    });
    
    // Update cumulative metrics
    this.metrics.tokensSavedCum += improvements.tokensSaved;
    this.metrics.timeSavedCum += improvements.timeSaved;
    this.metrics.qualityGainsCum += improvements.qualityGain;
    this.metrics.adoptionCount += 1;
    
    return {
      applied: true,
      adoption: adoption,
      improvements: improvements
    };
  }

  /**
   * Estimate improvements from applying pattern
   * Based on pattern metrics vs. current performance
   */
  estimateImprovements(pattern, beforeMetrics) {
    const metrics = pattern.metrics || {};
    
    // Token savings: pattern tokens vs. before
    const patternTokens = metrics.tokensSaved || 0;
    const beforeTokens = beforeMetrics.tokens || 100; // Default assumption
    const tokensSaved = Math.max(0, beforeTokens - (beforeTokens * 0.3)); // Conservative 30% savings
    
    // Time savings
    const patternTime = metrics.timeMinutes || 0;
    const beforeTime = beforeMetrics.timeMinutes || 5;
    const timeSaved = Math.max(0, beforeTime - patternTime);
    
    // Cost savings
    const costBefore = beforeMetrics.costDollars || 0.10;
    const costAfter = metrics.costDollars || 0.05;
    const costSavings = Math.max(0, costBefore - costAfter);
    
    // Quality gain
    const qualityBefore = beforeMetrics.quality || 6.0;
    const qualityAfter = metrics.qualityScore || 8.5;
    const qualityGain = Math.max(0, qualityAfter - qualityBefore);
    const expectedQuality = qualityBefore + qualityGain;
    
    return {
      tokensSaved: Math.round(tokensSaved),
      timeSaved: parseFloat((timeSaved).toFixed(2)),
      costSavings: parseFloat(costSavings.toFixed(3)),
      qualityGain: parseFloat(qualityGain.toFixed(2)),
      expectedQuality: parseFloat(expectedQuality.toFixed(2)),
      roi: Math.round((qualityGain / (costBefore || 0.01)) * 100) // ROI as quality per dollar
    };
  }

  /**
   * Get adoption rate
   */
  getAdoptionRate(exposures) {
    this.metrics.totalExposures += exposures;
    return {
      adoptionCount: this.metrics.adoptionCount,
      exposures: this.metrics.totalExposures,
      adoptionRate: this.metrics.totalExposures > 0 
        ? (this.metrics.adoptionCount / this.metrics.totalExposures * 100).toFixed(1)
        : 0,
      threshold: '50%'
    };
  }

  /**
   * Get cumulative improvements
   */
  getMetrics() {
    return {
      totalAdoptions: this.metrics.adoptionCount,
      tokensSaved: this.metrics.tokensSavedCum,
      timeSaved: parseFloat(this.metrics.timeSavedCum.toFixed(2)),
      qualityGains: parseFloat(this.metrics.qualityGainsCum.toFixed(2)),
      avgQualityGainPerAdoption: this.metrics.adoptionCount > 0
        ? parseFloat((this.metrics.qualityGainsCum / this.metrics.adoptionCount).toFixed(2))
        : 0
    };
  }

  /**
   * Get adoption history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get applied patterns
   */
  getAppliedPatterns() {
    return [...this.appliedPatterns];
  }

  /**
   * Reject a pattern
   */
  rejectPattern(pattern, reason) {
    this.history.push({
      type: 'rejection',
      timestamp: Date.now(),
      pattern: pattern.approach,
      reason: reason
    });
    
    return {
      rejected: true,
      reason: reason
    };
  }

  /**
   * Get rejection rate
   */
  getRejectionStats() {
    const rejections = this.history.filter(h => h.type === 'rejection');
    return {
      totalRejections: rejections.length,
      byReason: rejections.reduce((acc, r) => {
        acc[r.reason] = (acc[r.reason] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Simulate applying multiple patterns (for testing)
   */
  simulateAdoptions(patterns, beforeMetricsTemplate, adoptionRate = 0.7) {
    const adopted = [];
    const rejected = [];
    
    for (const pattern of patterns) {
      // Simulate acceptance probability
      if (Math.random() < adoptionRate) {
        const result = this.applyPattern(pattern, beforeMetricsTemplate);
        if (result.applied) {
          adopted.push(pattern);
        } else {
          rejected.push({ pattern, reason: result.reason });
        }
      } else {
        rejected.push({ pattern, reason: 'random-skip' });
      }
    }
    
    return {
      adopted: adopted.length,
      rejected: rejected.length,
      adoptedPatterns: adopted,
      rejectedPatterns: rejected
    };
  }

  /**
   * Clear all data (test only)
   */
  clear() {
    this.appliedPatterns = [];
    this.history = [];
    this.metrics = {
      tokensSavedCum: 0,
      timeSavedCum: 0,
      qualityGainsCum: 0,
      adoptionCount: 0,
      totalExposures: 0
    };
  }
}

module.exports = PatternApplier;
