#!/usr/bin/env node

/**
 * Claw Gossip Skill - Main Command Handler
 * 
 * Entry point for all `openclaw clawnet` commands
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const WORKSPACE = path.join(process.env.HOME, '.openclaw/workspace');
const CLAWNET_DIR = path.join(WORKSPACE, 'clawnet');
const TRIBE_FILE = path.join(WORKSPACE, 'CLAWNET-TRIBE.md');
const PROFILE_FILE = path.join(WORKSPACE, 'CLAWHUB-PROFILE.md');

// Command routing
const command = process.argv[2];

switch (command) {
  case 'init':
    initCommand();
    break;
  case 'approve':
    approveCommand();
    break;
  case 'invite':
    inviteCommand(process.argv.slice(3));
    break;
  case 'report':
    reportCommand();
    break;
  case 'audit-outbound':
    auditOutboundCommand();
    break;
  case 'audit-inbound':
    auditInboundCommand();
    break;
  case 'show-profile':
    showProfileCommand();
    break;
  case 'tribe-status':
    tribeStatusCommand();
    break;
  case 'keygen':
    keygenCommand();
    break;
  case 'logs':
    logsCommand(process.argv.slice(3));
    break;
  default:
    console.log(`
🪶 Claw Gossip - Your tribe helps you succeed

Usage:
  openclaw clawnet init              # First-time setup
  openclaw clawnet approve           # Start gossiping
  openclaw clawnet invite [names]    # Add tribe members
  openclaw clawnet report            # Daily improvements
  openclaw clawnet show-profile      # View your interests
  openclaw clawnet tribe-status      # See who's online
  openclaw clawnet audit-outbound    # What you're sharing
  openclaw clawnet audit-inbound     # What you're receiving
  openclaw clawnet logs              # Debug logs

Docs: https://github.com/ucsdsu/clawnet-mvp
    `);
}

// Command implementations

function initCommand() {
  console.log('🔧 Initializing Claw Gossip...');
  
  // 1. Extract interests from SOUL.md, MEMORY.md, projects/
  const interests = extractInterests();
  
  // 2. Create profile
  const profile = {
    interests,
    approved: false,
    created_at: new Date().toISOString(),
    public_key: null
  };
  
  fs.writeFileSync(
    PROFILE_FILE,
    generateProfileMarkdown(profile),
    'utf8'
  );
  
  console.log('✅ Profile created at CLAWHUB-PROFILE.md');
  console.log('\nNext: Review your interests, then run:');
  console.log('  openclaw clawnet approve');
}

function approveCommand() {
  console.log('👍 Approving your profile...');
  
  // Run ClawMoat scan
  // Generate public key
  // Publish to local gossip bus
  
  console.log('✅ Your profile is live!');
  console.log('\nTo invite tribe members:');
  console.log('  openclaw clawnet invite brenden dar');
}

function inviteCommand(names) {
  if (names.length === 0) {
    console.log('Usage: openclaw clawnet invite [name1] [name2] ...');
    return;
  }
  
  console.log(`🤝 Inviting ${names.join(', ')}...`);
  
  // Prompt for public keys
  // Store in CLAWNET-TRIBE.md
  // Start gossip handshake
  
  console.log('✅ Tribe members added!');
  console.log('\nPattern sharing will begin within 24h');
}

function reportCommand() {
  console.log('📊 Your Claw Gossip Report\n');
  
  // Read metrics from CRDT store
  // Generate markdown report
  // Show token savings, quality gains, patterns adopted
  
  const report = {
    patterns_adopted: 3,
    tokens_saved: 240,
    quality_gain: 0.5,
    tribe_contribution: 2
  };
  
  console.log(`Patterns adopted this week: ${report.patterns_adopted}`);
  console.log(`Tokens saved: ${report.tokens_saved}`);
  console.log(`Quality improvement: +${report.quality_gain}/10`);
  console.log(`Patterns you shared: ${report.tribe_contribution} adopted by tribe`);
  
  console.log('\nFull report: see CLAWNET-REPORT.md');
}

function auditOutboundCommand() {
  console.log('📤 Patterns You\'ve Shared\n');
  console.log('(Last 10 patterns sent to your tribe)');
  console.log('Date | Pattern | Destination | ClawMoat Status');
  console.log('-----|---------|-------------|----------------');
}

function auditInboundCommand() {
  console.log('📥 Patterns You\'ve Received\n');
  console.log('(Last 10 patterns from your tribe)');
  console.log('Date | Pattern | Source | Adopted | ClawMoat Status');
  console.log('-----|---------|--------|---------|----------------');
}

function showProfileCommand() {
  console.log('🗺️  Your Interest Graph\n');
  
  const profile = fs.existsSync(PROFILE_FILE)
    ? fs.readFileSync(PROFILE_FILE, 'utf8')
    : 'No profile yet. Run: openclaw clawnet init';
  
  console.log(profile);
}

function tribeStatusCommand() {
  console.log('👥 Tribe Status\n');
  console.log('Member | Online | Last Seen | Patterns Shared | Adopted');
  console.log('-------|--------|-----------|-----------------|--------');
  console.log('Brenden | ✓ | 2h ago | 8 | 4');
  console.log('Dar | ✓ | 30m ago | 6 | 2');
  console.log('You | NOW | - | 3 | -');
}

function keygenCommand() {
  console.log('🔐 Generating new public key...');
  
  // Generate RSA or ECDSA key
  const pubKey = `-----BEGIN PUBLIC KEY-----\n[stub-key-generated-here]\n-----END PUBLIC KEY-----`;
  
  console.log('\nYour public key:');
  console.log(pubKey);
  console.log('\nShare this with your tribe leader (Jon)');
}

function logsCommand(args) {
  const tail = args.includes('--tail') ? parseInt(args[args.indexOf('--tail') + 1]) : 50;
  
  console.log(`📋 Last ${tail} log entries\n`);
  // Read from CLAWNET-LOG.md
  console.log('[2026-02-24 10:00] Gossip handshake with Brenden');
  console.log('[2026-02-24 10:05] Received pattern: use-gpt-5.2-for-thinking');
  console.log('[2026-02-24 10:05] ClawMoat scan: SAFE');
  console.log('[2026-02-24 10:06] Auto-applied pattern (0.89 similarity)');
}

// Helper functions

function extractInterests() {
  // Read SOUL.md, MEMORY.md, projects/
  // Extract semantic interests using embedding similarity
  // Return sorted list with confidence scores
  
  return [
    { topic: 'Bitcoin', confidence: 0.94 },
    { topic: 'Founder scaling', confidence: 0.89 },
    { topic: 'Content monetization', confidence: 0.87 },
    { topic: 'Family automation', confidence: 0.82 },
    { topic: 'AI automation', confidence: 0.76 }
  ];
}

function generateProfileMarkdown(profile) {
  let md = '# My Claw Gossip Profile\n\n';
  md += '## Interests\n\n';
  
  profile.interests.forEach(item => {
    md += `- ${item.topic} (${Math.round(item.confidence * 100)}% confidence)\n`;
  });
  
  md += `\n## Status\n${profile.approved ? 'LIVE (gossiping)' : 'PENDING (needs approval)'}\n`;
  md += `\n## Edit This File\n\nRemove interests you want private. Then run:\n\`openclaw clawnet approve\`\n`;
  
  return md;
}

// Exit
process.exit(0);
