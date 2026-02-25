# Gossip Bus Data — Pattern Exchange Log

This directory stores the pattern exchange between claws during the 14-day MVP test.

## What's Here

- **gossip-bus/** — Live pattern exchange folder
  - One JSON file per sync cycle per claw
  - Format: `{clawId}-{timestamp}.json`
  - Example: `jon-1708858347.json`, `brenden-1708858401.json`
  - Auto-generated during daily midnight UTC sync

## How It Works

1. **Day 1, Midnight UTC:** Each claw publishes patterns
   ```
   data/gossip-bus/
   ├── jon-1708858347.json (Jon's patterns)
   ├── brenden-1708858401.json (Brenden's patterns)
   └── dar-1708858423.json (Dar's patterns)
   ```

2. **Day 1, After Sync:** Each claw reads all files
   - Applies matching patterns (>0.85 similarity)
   - Tracks improvements (tokens, time, quality)
   - Generates daily report

3. **Day 2-14:** Repeat (new patterns published daily)

## File Format

Each JSON file contains:
```json
{
  "id": "jon-1708858347-abc123def",
  "timestamp": 1708858347,
  "publisherId": "jon",
  "patterns": [
    {
      "approach": "use-gpt-5.2-for-strategic-decisions",
      "contexts": ["financial-planning", "major-decisions"],
      "metrics": {
        "quality": 9,
        "tokens": 340,
        "time_minutes": 2.3
      },
      "confidence": 0.94
    }
  ],
  "interestVector": ["Bitcoin", "Founder scaling", "Content monetization"],
  "ttl": 7
}
```

## Privacy & Security

- ✅ ClawMoat scans every pattern before storage (credentials, PII detection)
- ✅ Patterns contain approach + metrics (no personal data, no outputs)
- ✅ MEMORY.md never shared
- ✅ Credentials never shared

## Audit Trail

Git tracks every pattern exchange:
```bash
git log --oneline -- data/gossip-bus/
```

Shows exact history of what was shared, when, and by whom.

## After MVP Test

If you make the repo private, patterns stay private.  
If you keep it public, you have a real case study (14 days of actual gossip).

---

**Status:** Ready for 14-day MVP test with Jon, Brenden, and Dar
