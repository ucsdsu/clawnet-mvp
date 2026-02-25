#!/bin/bash

# Claw Gossip Installation Script

set -e

echo "🪶 Installing Claw Gossip (ClawNet MVP)..."

# Check if OpenClaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw not found. Install from https://github.com/openclaw/openclaw"
    exit 1
fi

# Create skill directory
SKILL_DIR="$HOME/.openclaw/workspace/skills/clawnet"
mkdir -p "$SKILL_DIR"

# Copy skill files
echo "📦 Installing skill files..."
cp -r skills/clawnet/* "$SKILL_DIR/"

# Create workspace directories
echo "📁 Creating workspace directories..."
mkdir -p "$HOME/.openclaw/workspace/clawnet"/{logs,metrics,tribe}

# Initialize config
echo "⚙️  Initializing configuration..."
cat > "$HOME/.openclaw/workspace/CLAWNET-CONFIG.json" << 'EOF'
{
  "min_embedding_similarity": 0.85,
  "daily_report_time": "00:00:00Z",
  "quality_floor": 7.0,
  "clawmoat_enabled": true,
  "auto_apply_patterns": true,
  "pattern_retention_days": 30,
  "protocol_version": "0.1.0"
}
EOF

# Initialize empty tribe file
cat > "$HOME/.openclaw/workspace/CLAWNET-TRIBE.md" << 'EOF'
# Claw Gossip Tribe

Your tribe members will appear here after you invite them.

## Format
Each member gets a section:
```
### Member Name
- Public Key: [key]
- Interest Vector: [interests]
- Last Seen: never
- Patterns Shared: 0
- Patterns Adopted: 0
```

Use `openclaw clawnet invite [name]` to add members.
EOF

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run: openclaw clawnet init"
echo "2. Review your profile: openclaw clawnet show-profile"
echo "3. Approve to start gossiping: openclaw clawnet approve"
echo "4. Invite tribe: openclaw clawnet invite brenden dar"
echo ""
echo "Full docs: https://github.com/ucsdsu/clawnet-mvp"
