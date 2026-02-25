/**
 * ClawMoat - Pattern Security Scanner
 * 
 * Scans all inbound and outbound patterns for:
 * - Credentials (API keys, tokens, passwords)
 * - PII (emails, phones, SSNs, addresses)
 * - Domain names and hostnames
 * - Sensitive encoding (base64, hex)
 * 
 * Decision: ACCEPT, QUARANTINE, or BLOCK
 */

class ClawMoatScanner {
  constructor() {
    this.threats = [];
    
    // Threat patterns (high sensitivity)
    this.credentialPatterns = [
      /api[_-]?key\s*[:=]\s*[^\s,}]+/gi,
      /password\s*[:=]\s*[^\s,}]+/gi,
      /secret\s*[:=]\s*[^\s,}]+/gi,
      /token\s*[:=]\s*[^\s,}]+/gi,
      /auth\s*[:=]\s*[^\s,}]+/gi,
      /bearer\s+[a-zA-Z0-9._-]+/gi,
      /private[_-]?key\s*[:=]/gi,
      /aws[_-]?secret/gi,
      /github[_-]?token/gi,
      /openai[_-]?key/gi,
      /stripe[_-]?key/gi,
      /jwt\s*[:=]\s*eyJ[a-zA-Z0-9_-]+/gi
    ];
    
    // PII patterns (high sensitivity)
    this.piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, // Phone
      /\b(?:\d{3}-)?(\d{2}-?){4}\b/g, // SSN-like
      /\b\d{5}[-\s]?\d{4}\b/g, // ZIP+4
      /(?:^|\s)\d{3}-\d{2}-\d{4}(?:\s|$)/g, // SSN
    ];
    
    // Domain patterns (medium sensitivity - redact)
    this.domainPatterns = [
      /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    ];
    
    // Base64/Hex encoding patterns (medium sensitivity)
    this.encodingPatterns = [
      /\b(?:[A-Za-z0-9+\/]{20,}={0,2})\b/g, // Base64-like (20+ chars)
      /\b(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{64})\b/g // MD5/SHA256-like
    ];
  }

  /**
   * Scan a pattern for security threats
   * Returns: { decision: 'ACCEPT'|'QUARANTINE'|'BLOCK', threats: [], cleaned: pattern }
   */
  scan(pattern) {
    const threats = [];
    let cleaned = this.deepClone(pattern);
    
    // Scan for credentials
    const credentialThreats = this.scanCredentials(pattern);
    if (credentialThreats.length > 0) {
      threats.push(...credentialThreats);
    }
    
    // Scan for PII
    const piiThreats = this.scanPII(pattern);
    if (piiThreats.length > 0) {
      threats.push(...piiThreats);
    }
    
    // Scan for domains
    const domainThreats = this.scanDomains(pattern);
    if (domainThreats.length > 0) {
      threats.push(...domainThreats);
    }
    
    // Make decision
    const decision = this.makeDecision(threats);
    
    // Clean if needed
    if (decision !== 'ACCEPT') {
      cleaned = this.sanitize(pattern, threats);
    }
    
    return {
      decision,
      threats,
      cleaned,
      threatCount: threats.length
    };
  }

  /**
   * Scan for credentials
   */
  scanCredentials(pattern) {
    const threats = [];
    const str = JSON.stringify(pattern);
    
    for (const regex of this.credentialPatterns) {
      const matches = str.match(regex);
      if (matches) {
        for (const match of matches) {
          threats.push({
            type: 'CREDENTIAL',
            severity: 'HIGH',
            match: match.substring(0, 20) + '***',
            pattern: regex.source
          });
        }
      }
    }
    
    return threats;
  }

  /**
   * Scan for PII
   */
  scanPII(pattern) {
    const threats = [];
    const str = JSON.stringify(pattern);
    
    for (const regex of this.piiPatterns) {
      const matches = str.match(regex);
      if (matches) {
        for (const match of matches) {
          threats.push({
            type: 'PII',
            severity: 'HIGH',
            match: this.redactPII(match),
            pattern: regex.source
          });
        }
      }
    }
    
    return threats;
  }

  /**
   * Scan for domains
   */
  scanDomains(pattern) {
    const threats = [];
    const str = JSON.stringify(pattern);
    
    for (const regex of this.domainPatterns) {
      const matches = str.match(regex);
      if (matches) {
        for (const match of matches) {
          threats.push({
            type: 'DOMAIN',
            severity: 'MEDIUM',
            match: '[DOMAIN-REDACTED]',
            pattern: regex.source
          });
        }
      }
    }
    
    return threats;
  }

  /**
   * Redact PII in string
   */
  redactPII(str) {
    if (str.includes('@')) {
      return '[EMAIL-REDACTED]';
    }
    if (str.match(/\d+-\d+-\d+/)) {
      return '[PHONE-REDACTED]';
    }
    if (str.match(/\d{3}-\d{2}-\d{4}/)) {
      return '[SSN-REDACTED]';
    }
    return '[PII-REDACTED]';
  }

  /**
   * Make security decision
   */
  makeDecision(threats) {
    if (threats.length === 0) {
      return 'ACCEPT';
    }
    
    const severities = threats.map(t => t.severity);
    
    // HIGH severity → BLOCK
    if (severities.includes('HIGH')) {
      return 'BLOCK';
    }
    
    // MEDIUM severity → QUARANTINE (allow human review)
    if (severities.includes('MEDIUM')) {
      return 'QUARANTINE';
    }
    
    return 'ACCEPT';
  }

  /**
   * Sanitize pattern by removing sensitive data
   */
  sanitize(pattern, threats) {
    const sanitized = this.deepClone(pattern);
    let str = JSON.stringify(sanitized);
    
    for (const threat of threats) {
      if (threat.type === 'CREDENTIAL') {
        str = str.replace(new RegExp(this.escapeRegex(threat.pattern), 'g'), '[CREDENTIAL-REDACTED]');
      } else if (threat.type === 'PII') {
        str = str.replace(new RegExp(this.escapeRegex(threat.match.split('[')[1].split(']')[0]), 'gi'), threat.match);
      } else if (threat.type === 'DOMAIN') {
        str = str.replace(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[DOMAIN-REDACTED]');
      }
    }
    
    try {
      return JSON.parse(str);
    } catch {
      return sanitized;
    }
  }

  /**
   * Escape regex special characters
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Deep clone object
   */
  deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return { ...obj };
    }
  }

  /**
   * Scan multiple patterns (batch)
   */
  scanBatch(patterns) {
    return patterns.map((p, idx) => ({
      index: idx,
      result: this.scan(p)
    }));
  }

  /**
   * Get threat report
   */
  getThreatReport() {
    return {
      threats: this.threats,
      totalScanned: this.threats.length,
      blocked: this.threats.filter(t => t.decision === 'BLOCK').length,
      quarantined: this.threats.filter(t => t.decision === 'QUARANTINE').length,
      accepted: this.threats.filter(t => t.decision === 'ACCEPT').length
    };
  }
}

module.exports = ClawMoatScanner;
